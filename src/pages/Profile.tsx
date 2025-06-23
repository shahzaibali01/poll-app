import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import {
    Card,
    Typography,
    Skeleton,
    message,
    Button,
    Space,
    Divider,
    Tag,
    Flex,
} from "antd";
import { DeleteOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type Poll = {
    id: string;
    question: string;
    created_at: string;
    ends_at?: string | null;
    vote_count?: number;
};

export default function Profile() {
    const { user } = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchPolls = async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from("polls_with_votes")
            .select("*")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading polls:", error.message);
        } else {
            setPolls(data ?? []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchPolls();
    }, [user]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const { error } = await supabase.from("polls").delete().eq("id", id);
        if (error) {
            message.error("Failed to delete poll");
        } else {
            message.success("Poll deleted successfully");
            setPolls((prev) => prev.filter((p) => p.id !== id));
        }
        setDeletingId(null);
    };

    const showDeleteConfirm = (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this poll?");
        if (confirmed) {
            handleDelete(id);
        }
    };

    const isEnded = (poll: Poll) => {
        return poll.ends_at ? new Date(poll.ends_at) < new Date() : false;
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 pt-[70px]">
            <Flex style={{ width: "100%" }} align="center" justify="space-between">
                <Title level={2} className="!text-2xl md:!text-3xl lg:!text-4xl">
                    Your Profile
                </Title>
                <Button
                    danger
                    type="primary"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.reload();
                    }}
                >
                    Logout
                </Button>
            </Flex>

            {user && (
                <div className="mt-4">
                    <Text strong>Email:</Text>
                    <input
                        disabled
                        className="w-full mt-1 mb-6 font-medium border border-gray-300 rounded px-3 py-2"
                        type="text"
                        value={user.email}
                    />
                </div>
            )}

            <Divider>Your Created Polls</Divider>

            {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : polls.length === 0 ? (
                <Text type="secondary">You haven’t created any polls yet.</Text>
            ) : (
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    {polls.map((poll) => (
                        <Card
                            key={poll.id}
                            title={poll.question}
                            extra={
                                <Space>
                                    <Link to={`/poll/${poll.id}`}>
                                        <EyeOutlined /> View
                                    </Link>
                                    <Link to={`/edit/${poll.id}`}>
                                        <EditOutlined /> Edit
                                    </Link>
                                    <Button
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        loading={deletingId === poll.id}
                                        onClick={() => showDeleteConfirm(poll.id)}
                                    >
                                        Delete
                                    </Button>
                                </Space>
                            }
                        >
                            <Space size="middle" wrap>
                                <Text type="secondary">
                                    Created: {new Date(poll.created_at).toLocaleString()}
                                </Text>
                                {poll.ends_at && (
                                    <Tag color={isEnded(poll) ? "red" : "green"}>
                                        {isEnded(poll) ? "Ended" : "Active"}
                                    </Tag>
                                )}
                                <Tag color="blue">Total Votes: {poll.vote_count ?? 0}</Tag>
                            </Space>
                        </Card>
                    ))}
                </Space>
            )}
        </div>
    );
}
