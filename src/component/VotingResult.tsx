import {
    Button,
    Alert,
    Typography,
    Space,
} from "antd";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Legend,
} from "recharts";

const { Text } = Typography;

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#13c2c2"];

interface ChartData {
    name: string;
    value: number;
    percent: number;
}

interface PollSettings {
    showResultsBeforeVoting: boolean;
}

interface Poll {
    settings: PollSettings;
}

type ChartView = "bar" | "pie" | "list";

interface VotingResultProps {
    hasVoted: boolean;
    poll: Poll;
    isEnded: boolean;
    activeViewers: number;
    chartView: ChartView;
    setChartView: (view: ChartView) => void;
    handleExportCSV: () => void;
    totalVotes: number;
    data: ChartData[];
}

export function VotingResult({
    hasVoted,
    poll,
    isEnded,
    activeViewers,
    chartView,
    setChartView,
    handleExportCSV,
    totalVotes,
    data
}: VotingResultProps) {

    return (
        <>
            {(hasVoted || poll.settings.showResultsBeforeVoting || isEnded) && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <Text type="secondary">👥 {activeViewers} viewing</Text>
                        <Space wrap>
                            {["bar", "pie", "list"].map((view) => (
                                <Button
                                    key={view}
                                    onClick={() => setChartView(view as ChartView)}
                                    type={chartView === view ? "primary" : "default"}
                                >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                </Button>
                            ))}
                            <Button onClick={handleExportCSV}>Export CSV</Button>
                        </Space>
                    </div>

                    {totalVotes === 0 && (
                        <Alert message="No votes yet. Be the first to vote!" type="info" showIcon className="mb-4" />
                    )}
                    <br />
                    {chartView === "list" && (
                        <ul className="space-y-1 text-sm">
                            {data.map((d) => (
                                <li key={d.name} className="flex justify-between">
                                    <span>{d.name}</span>
                                    <span>{d.value} votes ({d.percent}%)</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {chartView === "pie" && (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={data} dataKey="value" nameKey="name" outerRadius={120} label>
                                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    {chartView === "bar" && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value">
                                    {data.map((_, i) => (
                                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}

            {(hasVoted || isEnded) && (
                <Text className="block text-center mt-4 text-green-600">Thanks for voting!</Text>
            )}
        </>
    );
}
