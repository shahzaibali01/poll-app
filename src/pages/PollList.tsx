import { useEffect, useState, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import {
    Card,
    Button,
    Input,
    Skeleton,
    Space,
    Tag,
    Pagination,
    Typography,
} from "antd";
import { ShareAltOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import ShareModal from "../component/ShareModal";

interface Poll {
    id: string;
    question: string;
    created_at: string;
    ends_at: string | null;
    vote_count: number;
    created_by: string;
}

const PAGE_SIZE = 10;

export default function PollList() {
    const { user } = useAuth();
    const { Title } = Typography;
    const [polls, setPolls] = useState<Poll[]>([]);
    const [filter, setFilter] = useState<"all" | "active" | "ended" | "mine">("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string>("")

    const debouncedSearch = useMemo(() => debounce((val: string) => setSearch(val), 500), []);

    const fetchPolls = async () => {
        setLoading(true);
        let query = supabase
            .from("polls_with_votes")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        const now = new Date().toISOString();
        if (filter === "active") query = query.or(`ends_at.is.null,ends_at.gt.${now}`);
        else if (filter === "ended") query = query.filter("ends_at", "lt", now);
        else if (filter === "mine" && user) query = query.eq("created_by", user.id);

        if (search.trim()) query = query.ilike("question", `%${search.trim()}%`);

        const { data, count, error } = await query;
        if (!error && data) {
            setPolls(data as Poll[]);
            setTotalPages(Math.ceil((count ?? 1) / PAGE_SIZE));
        }
        setLoading(false);
    };

    function handleShare(id: string) {
        setShareLink(id)
        setOpen(true)
    }

    useEffect(() => {
        fetchPolls();
    }, [filter, search, page, user]);



    return (
        <div className="pt-[70px] max-w-[800px] mx-auto p-5">
            <Title level={2} className="!text-2xl md:!text-3xl lg:!text-4xl mb-5">
                Public Polls
            </Title>
            <br />
            <ShareModal visible={open} onClose={() => setOpen(false)} shareUrl={shareLink} />
            <Space wrap style={{ marginBottom: 16 }}>
                {[
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "ended", label: "Ended" },
                    { key: "mine", label: "My Polls" },
                ].map((f) => (
                    <Button
                        key={f.key}
                        type={filter === f.key ? "primary" : "default"}
                        onClick={() => {
                            setFilter(f.key as any);
                            setPage(1);
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Space>

            <Input.Search
                placeholder="Search by question..."
                onChange={(e) => debouncedSearch(e.target.value)}
                style={{ marginBottom: 20 }}
                allowClear
            />

            {loading ? (
                Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} active />)
            ) : (
                polls.map((poll) => (
                    <Card
                        key={poll.id}
                        title={<Link to={`/poll/${poll.id}`}>{poll.question}</Link>}
                        extra={

                            <Button icon={<ShareAltOutlined />} onClick={() => handleShare(poll.id)} />

                        }
                        style={{ marginBottom: 20 }}
                    >
                        <Space direction="vertical">
                            <div>
                                <strong>Status:</strong>{" "}
                                <Tag color={poll.ends_at && new Date(poll.ends_at) < new Date() ? "red" : "green"}>
                                    {poll.ends_at ?
                                        (new Date(poll.ends_at) < new Date() ? "Ended" : `Ends at ${new Date(poll.ends_at).toLocaleString()}`)
                                        : "No end date"}
                                </Tag>
                            </div>
                            <div>
                                <strong>Votes:</strong> {poll.vote_count}
                            </div>

                        </Space>
                    </Card>
                ))
            )}

            <Pagination
                current={page}
                total={totalPages * PAGE_SIZE}
                pageSize={PAGE_SIZE}
                onChange={(p) => setPage(p)}
                style={{ marginTop: 20, textAlign: "center" }}
            />
        </div>
    );
}
