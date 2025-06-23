
import {
  Checkbox,
  Radio,
  Button,
  Alert,
  Card,
  Typography,
  Skeleton,
} from "antd";
import { ShareAltOutlined } from "@ant-design/icons";
import { usePollDetail } from "../hooks/usePollDetail";
import ShareModal from "../component/ShareModal";
import { VotingResult } from "../component/VotingResult";

const { Text } = Typography;

const PollDetail = () => {
  const {
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
  } = usePollDetail();

  if (loading) return <div className="max-w-2xl mx-auto p-4"><Skeleton active paragraph={{ rows: 18 }} /></div>;

  if (!poll) return <Alert type="error" message="Poll not found" showIcon />;

  return (
    <div className="max-w-2xl mx-auto p-4 pt-[70px]">
      <Card
        title={poll.question}
        extra={<Button icon={<ShareAltOutlined />} onClick={() => setOpen(true)} />}
      >
        <ShareModal visible={open} onClose={() => setOpen(false)} shareUrl={poll.id} />

        <Text type="secondary" className="block mb-3">
          {poll.settings.allowMultiple ? "You can select multiple options" : "Select one option"}
        </Text>

        {poll.settings.allowMultiple ? (
          <Checkbox.Group
            options={poll.options}
            value={selected}
            onChange={val => setSelected(val as string[])}
            className="flex flex-col gap-2 mb-4"
          />
        ) : (
          <Radio.Group
            options={poll.options}
            value={selected[0]}
            onChange={(e) => setSelected([e.target.value])}
            className="flex flex-col gap-2 mb-4"
          />
        )}

        {!hasVoted && !isEnded && (
          <Button
            type="primary"
            className="w-full mt-4"
            disabled={selected.length === 0}
            onClick={handleVote}
          >
            Submit Vote
          </Button>
        )}

        <VotingResult
          hasVoted={hasVoted}
          poll={poll}
          isEnded={!!isEnded}
          activeViewers={activeViewers}
          chartView={chartView}
          setChartView={setChartView}
          handleExportCSV={handleExportCSV}
          totalVotes={totalVotes}
          data={data}
        />
      </Card>
    </div>
  );
};

export default PollDetail;
