import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  DatePicker,
  Typography,
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import dayjs from "dayjs";

type FormData = {
  question: string;
  options: { value: string }[];
  allowMultiple: boolean;
  showResultsBeforeVoting: boolean;
  endsAt: string;
};

export default function PollForm() {
  const { user } = useAuth();
  const { pollId } = useParams();
  const isEditing = !!pollId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      question: "",
      options: [{ value: "" }, { value: "" }],
      allowMultiple: false,
      showResultsBeforeVoting: false,
      endsAt: "",
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "options",
  });

  useEffect(() => {
    if (!pollId) return;

    const fetchPoll = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("id", pollId)
        .single();

      if (error || !data) {
        toast.error("Failed to load poll");
        return navigate("/profile");
      }

      reset({
        question: data.question,
        options: data.options.map((val: string) => ({ value: val })),
        allowMultiple: data.settings?.allowMultiple || false,
        showResultsBeforeVoting: data.settings?.showResultsBeforeVoting || false,
        endsAt: data.ends_at || "",
      });

      replace(data.options.map((val: string) => ({ value: val })));
      setLoading(false);
    };

    fetchPoll();
  }, [pollId]);

  const onSubmit = async (data: FormData) => {
    const validOptions = data.options.map((o) => o.value.trim()).filter(Boolean);
    if (validOptions.length < 2 || validOptions.length > 10) {
      toast.error("You must provide between 2 and 10 options.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase.from("polls").update({
          question: data.question,
          options: validOptions,
          settings: {
            allowMultiple: data.allowMultiple,
            showResultsBeforeVoting: data.showResultsBeforeVoting,
          },
          ends_at: data.endsAt || null,
        }).eq("id", pollId);

        if (error) throw error;
        toast.success("Poll updated!");
        navigate(`/poll/${pollId}`);
      } else {
        const { data: inserted, error } = await supabase.from("polls").insert({
          question: data.question,
          options: validOptions,
          settings: {
            allowMultiple: data.allowMultiple,
            showResultsBeforeVoting: data.showResultsBeforeVoting,
          },
          ends_at: data.endsAt || null,
          created_by: user?.id,
        }).select().single();

        if (error) throw error;
        toast.success("Poll created!");
        navigate(`/poll/${inserted.id}?oneTime=true`);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Card
        title={
          <Typography.Title level={3}>
            {isEditing ? "Edit Poll" : "Create New Poll"}
          </Typography.Title>
        }
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Poll Question"
            validateStatus={errors.question ? "error" : ""}
            help={errors.question?.message}
          >
            <Controller
              name="question"
              control={control}
              rules={{ required: "Question is required" }}
              render={({ field }) => <Input {...field} placeholder="Enter poll question" />}
            />
          </Form.Item>

          <Form.Item label="Poll Options (2–10)">
            <Space direction="vertical" className="w-full">
              {fields.map((field, index) => (
                <Space key={field.id} className="w-full" align="baseline">
                  <Controller
                    name={`options.${index}.value`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input {...field} placeholder={`Option ${index + 1}`} className="w-full" />
                    )}
                  />
                  {fields.length > 2 && (
                    <MinusCircleOutlined onClick={() => remove(index)} className="text-red-500" />
                  )}
                </Space>
              ))}
              {fields.length < 10 && (
                <Button
                  type="dashed"
                  onClick={() => append({ value: "" })}
                  icon={<PlusOutlined />}
                  block
                >
                  Add Option
                </Button>
              )}
            </Space>
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" className="w-full">
              <Controller
                name="allowMultiple"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value}>
                    Allow multiple selections
                  </Checkbox>
                )}
              />
              <Controller
                name="showResultsBeforeVoting"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value}>
                    Show results before voting
                  </Checkbox>
                )}
              />
              <Controller
                name="endsAt"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    showTime
                    className="w-full"
                    placeholder="End date (optional)"
                    onChange={(date) =>
                      field.onChange(date ? date.toISOString() : "")
                    }
                    value={field.value ? dayjs(field.value) : null}
                  />
                )}
              />
            </Space>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              block
            >
              {isEditing ? "Update Poll" : "Create Poll"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
