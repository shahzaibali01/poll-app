import { useState } from "react";
import { Card, Form, Input, Button, Typography } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../services/supabaseClient";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      if (type === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Signed up successfully!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Logged in successfully!");
      }
      navigate("/profile");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <Card
        title={
          <Typography.Title level={3} className="text-center m-0">
            {type === "login" ? "Welcome Back" : "Create an Account"}
          </Typography.Title>
        }
        bordered={false}
        className="w-full max-w-md shadow-2xl"
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email ? "Email is required" : ""}
          >
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  className="autofill:shadow-[inset_0_0_0px_1000px_white]"
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            validateStatus={errors.password ? "error" : ""}
            help={errors.password ? "Password is required" : ""}
          >
            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="••••••••"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  className="autofill:shadow-[inset_0_0_0px_1000px_white]"
                />
              )}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              disabled={loading}
            >
              {type === "login" ? "Log In" : "Sign Up"}
            </Button>
          </Form.Item>
          <Typography.Paragraph className="text-center text-sm text-gray-600">
            {type === "login" ? (
              <>Don’t have an account? <Link to="/signup">Sign up</Link></>
            ) : (
              <>Already have an account? <Link to="/login">Log in</Link></>
            )}
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
}
