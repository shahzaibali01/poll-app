import { Modal, Input, Button, Space } from "antd";
import { FacebookFilled, TwitterOutlined, LinkedinFilled, WhatsAppOutlined, CopyOutlined } from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";

interface ShareModalProps {
  visible: boolean;
  shareUrl: string | undefined;
  onClose: () => void;
}

const ShareModal = ({ visible, shareUrl, onClose }: ShareModalProps) => {
  const handleCopy = () => {
    toast.success("Link copied to clipboard")
  };

  return (
    <Modal title="Share Poll" open={visible} onCancel={onClose} footer={null}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input addonBefore="Link" value={`${window.location.origin}/poll/${shareUrl}`} readOnly />
        <CopyToClipboard text={`${window.location.origin}/poll/${shareUrl}`} onCopy={handleCopy}>
          <Button icon={<CopyOutlined />}>Copy Link</Button>
        </CopyToClipboard>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/poll/${shareUrl}`} target="_blank" rel="noreferrer">
            <Button icon={<FacebookFilled />} type="primary">Facebook</Button>
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${window.location.origin}/poll/${shareUrl}`} target="_blank" rel="noreferrer">
            <Button icon={<TwitterOutlined />} style={{ backgroundColor: '#1DA1F2', color: '#fff' }}>Twitter</Button>
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/poll/${shareUrl}`} target="_blank" rel="noreferrer">
            <Button icon={<LinkedinFilled />} type="primary">LinkedIn</Button>
          </a>
          <a href={`https://api.whatsapp.com/send?text=${window.location.origin}/poll/${shareUrl}`} target="_blank" rel="noreferrer">
            <Button icon={<WhatsAppOutlined />} style={{ backgroundColor: '#25D366', color: '#fff' }}>WhatsApp</Button>
          </a>
        </div>
      </Space>
    </Modal>
  );
};

export default ShareModal;
