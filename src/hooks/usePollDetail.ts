import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./useAuth";

export interface Poll {
  id: string;
  question: string;
  options: string[];
  settings: {
    allowMultiple: boolean;
    showResultsBeforeVoting: boolean;
  };
  ends_at: string | null;
  created_by: string;
}

export const usePollDetail = () => {
  const { id, oneTime } = useParams();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [chartView, setChartView] = useState<"bar" | "pie" | "list">("bar");
  const [activeViewers, setActiveViewers] = useState(1);
  const presenceKey = useRef(user?.id ?? crypto.randomUUID()).current;
  const voteKey = `poll_${id}_voted`;

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const { data, error } = await supabase
          .from("polls")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          if (error.code === "PGRST116") toast.error("Poll not found.");
          else toast.error(`Error: ${error.message}`);
        } else setPoll(data);
      } catch {
        toast.error("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  useEffect(() => {
    if (oneTime && poll) setOpen(true);
  }, [oneTime, poll]);

  const fetchVotes = async () => {
    if (!poll) return;
    const { data } = await supabase
      .from("votes")
      .select("selected_options")
      .eq("poll_id", poll.id);

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      for (const opt of row.selected_options) {
        counts[opt] = (counts[opt] || 0) + 1;
      }
    }
    setVotes(counts);
  };

  useEffect(() => {
    fetchVotes();
  }, [poll, hasVoted]);

  useEffect(() => {
    if (!poll) return;

    const checkVoteStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from("votes")
          .select("id")
          .eq("poll_id", poll.id)
          .eq("user_id", user.id);
        if (data?.length) setHasVoted(true);
      } else {
        if (localStorage.getItem(voteKey)) setHasVoted(true);
      }
    };

    checkVoteStatus();
  }, [poll, user]);

  useEffect(() => {
    if (!poll) return;

    const channel = supabase.channel(`poll-${poll.id}`, {
      config: { presence: { key: presenceKey } },
    })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "votes",
        filter: `poll_id=eq.${poll.id}`,
      }, fetchVotes)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setActiveViewers(Object.keys(state).length);
      });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [poll]);

  useEffect(() => {
    if (!localStorage.getItem("client_ip_hash")) {
      localStorage.setItem("client_ip_hash", crypto.randomUUID());
    }
  }, []);

  const handleVote = async () => {
    if (!poll || selected.length === 0) return toast.error("Select at least one option");
    if (poll.ends_at && new Date(poll.ends_at).getTime() < Date.now()) {
      return toast.error("Voting ended");
    }

    const { error } = await supabase.from("votes").insert({
      poll_id: poll.id,
      selected_options: selected,
      user_id: user?.id ?? null,
      ip_hash: user ? user?.id : localStorage.getItem("client_ip_hash")
    });

    if (error) toast.error("You've already voted");
    else {
      if (!user) localStorage.setItem(voteKey, "true");
      toast.success("Vote submitted");
      setHasVoted(true);
    }
  };

  const handleExportCSV = () => {
    const csv = [["Option", "Votes"], ...Object.entries(votes)].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poll-${poll?.id}-results.csv`;
    a.click();
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const data = useMemo(() => {
    if (!poll) return [];
    return poll.options.map((option) => {
      const count = votes[option] || 0;
      return {
        name: option,
        value: count,
        percent: totalVotes ? Math.round((count / totalVotes) * 100) : 0,
      };
    });
  }, [poll, votes, totalVotes]);

  const isEnded = poll?.ends_at && new Date(poll.ends_at).getTime() < Date.now();

  return {
    poll,
    selected,
    setSelected,
    hasVoted,
    loading,
    open,
    setOpen,
    chartView,
    setChartView,
    handleVote,
    handleExportCSV,
    totalVotes,
    data,
    isEnded,
    activeViewers
  };
};
