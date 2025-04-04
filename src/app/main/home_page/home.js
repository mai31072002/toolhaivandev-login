import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, notification, Checkbox, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import withReducer from "../../store/with_reducer";
import reducer from "../../auth/store/reducers/auth.reducer";
import * as Actions from "../../auth/store/actions/auth.action";
import axios from "axios";
import { Link } from "react-router-dom";
import videoSrc from "assets/img/image_login/background-login.mp4";
import Logo from "assets/img/image_login/WP_logo_no-slogan.png";
import "./style.css";
import apiConfig from "../../configs/api.config";

const Home = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { login } = useSelector((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const videoRef = useRef(null);
  const hasPlayedOnceRef = useRef(false);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  // video
  useEffect(() => {
    const video = videoRef.current;
    let interval;

    if (video) {
      video.onended = () => {
        hasPlayedOnceRef.current = true;
        video.currentTime = 13;
        video.play();
      };

      interval = setInterval(() => { 
        if (video.currentTime >= 20 && hasPlayedOnceRef.current) {
          video.currentTime = 13;
        }
      }, 500);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const rememberedUser = localStorage.getItem(apiConfig.rememberUsername);
    if (rememberedUser) {
      setUsername(localStorage.getItem(apiConfig.rememberUsername));
      setPassword(localStorage.getItem(apiConfig.rememberPassword));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (login?.data !== null) {
      if (login?.status === 200) {
        history.push("/forecast"); 
      } else {
        openNotificationWithIcon("error", "Lỗi", "Đăng nhập không thành công");
      }
    }
    delete axios.defaults.headers.common.Authorization;
  }, [login, history]);

  useEffect(() => {
    if (login?.data !== null) {
      if (login?.status === 200) {
        if (rememberMe) {
          localStorage.setItem(apiConfig.rememberUsername, username);
          localStorage.setItem(apiConfig.rememberPassword, password);
        } else {
          localStorage.removeItem(apiConfig.rememberUsername);
          localStorage.removeItem(apiConfig.rememberPassword);
        }
      }
    }
  }, [login, rememberMe, username, password]);

  const openNotificationWithIcon = (
    type,
    message,
    description
  ) => {
    console.log("Notification nhận:", type, message, description);
    if (!description) {
      description = "Thông tin chưa xác định";
    }

    notification[type]({
      message: message || "Thông báo",
      description: description,
      duration: 5,
      placement: "topRight",
    });
  };

  const onSubmit = async (e) => {
    try {
      const response = await dispatch(Actions.submitLogin(e));
      console.log("status dats : ", response.status);
  
      if (response.status === 200) {
        openNotificationWithIcon("success", "Thành công", "Đăng nhập thành công !!!");
        history.push("/forecast");
      }
    } catch (error) {
      console.log("Bắt lỗi:", error);
      handleError(error);
    }
  };
  

  const handleError = (error) => {
    console.log("Lỗi API:", error);
  
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 400:
          openNotificationWithIcon("error", "Lỗi 400", "Yêu cầu không hợp lệ.");
          break;
        case 401:
          openNotificationWithIcon("error", "Lỗi 401", "Không có quyền truy cập.");
          break;
        case 404:
          openNotificationWithIcon("error", "Lỗi 404", "Email không tồn tại.");
          break;
        case 500:
          openNotificationWithIcon("error", "Lỗi 500", "Lỗi máy chủ.");
          break;
        default:
          openNotificationWithIcon("error", "Lỗi", "Đã có lỗi xảy ra.");
          break;
      }
    } else if (error.message === "Network Error") {
      openNotificationWithIcon("error", "Lỗi", "Không thể kết nối đến máy chủ.");
    } else {
      openNotificationWithIcon("error", "Lỗi", "Đã có lỗi xảy ra, vui lòng thử lại.");
    }
  };
  

  // Xử lý mở/đóng modal Forgot Password
  const showForgotModal = () => {
    setIsForgotModalOpen(true);
  };

  const handleForgotCancel = () => {
    setIsForgotModalOpen(false);
  };

  const [form] = Form.useForm();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const onValuesChange = (_, allValues) => {
    // Nếu bất kỳ trường nào còn trống thì disable submit
    const disabled =
      !allValues.username ||
      !allValues.email ||
      !allValues.password ||
      !allValues.confirmPassword;
    setIsSubmitDisabled(disabled);
  };


  // Xử lý submit form Forgot Password
  const handleForgotPasswordSubmit = async (values) => {
    console.log("Giá trị quên mật khẩu gửi lên:", values);
  
    setForgotLoading(true);
    try {
      const response = await axios.post(
        "https://api-gateway-dev.weatherplus.vn/oceanography/guest/forgot-password",
        {
          username: values.username,
          passwordNew: values.password,
          email: values.email,
        }
      );
  
      if (response.status === 200) {
        openNotificationWithIcon("success", "Thành công", "Mật khẩu đã được đặt lại thành công!");
        setIsForgotModalOpen(false); 
        if (values.rememberMe) {
          localStorage.setItem(apiConfig.rememberUsername, values.username);
          localStorage.setItem(apiConfig.rememberPassword, values.password);
        } else {
          localStorage.removeItem(apiConfig.rememberUsername);
          localStorage.removeItem(apiConfig.rememberPassword);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setForgotLoading(false);
    }
  };
  


  return (
    <div className="video-container">
      <video
        autoPlay
        muted
        playsInline
        ref={videoRef}
        className="video-bg"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="content">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <img
            src={Logo}
            alt="logo"
            style={{ display: "flex", justifyContent: "center" }}
          />
        </div>
        <div>
          <h1 style={{ color: "white" }}>OCEAN FORECAST SUPPORT TOOL</h1>
          <p className="f18" style={{ marginBottom: "24px" }}>
            Please fill your detail to access your account
          </p>
          <Form
            name="basic"
            className="18"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 400 }}
            initialValues={{ remember: true }}
            onFinish={onSubmit}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              className="f18 login-color"
              label="Username"
              name="username"
              style={{ color: "white" }}
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input
                className="f16 p-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              className="f18 login-color"
              label="Password"
              name="password"
              style={{ marginBottom: "10px", color: "white" }}
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                className="custom-password-input f16 p-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <Form.Item
                name="remember"
                valuePropName="checked"
                style={{ marginBottom: "0" }}
              >
                <Checkbox
                  style={{ color: "white" }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Remember me
                </Checkbox>
              </Form.Item>
              <span className="primary-color">
                <Link to={""} className={"link-forgot-password"} onClick={showForgotModal}>
                  Forgot Password?
                </Link>
              </span>
            </div>
            <Form.Item>
              <Button
                style={{ width: "100%", height: "auto" }}
                className="primary-bg f16 p-1"
                type="primary"
                htmlType="submit"
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <Modal
        open={isForgotModalOpen}
        title="Forgot Password"
        onCancel={handleForgotCancel}
        footer={null}
      >
        <Form
          form={form}
          name="forgotPasswordForm"
          layout="vertical"
          onFinish={handleForgotPasswordSubmit}
          onValuesChange={onValuesChange}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập username!" }]}
          >
            <Input placeholder="Nhập username của bạn" className="f16 p-1" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu" className="f16 p-1" />
          </Form.Item>
          <Form.Item
            label="Re-enter Password"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu"  className="f16 p-1" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email của bạn" className="f16 p-1" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={forgotLoading}
              className="primary-bg f16 p-1 forget-pass"
              disabled={isSubmitDisabled}
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default withReducer("login", reducer)(Home);