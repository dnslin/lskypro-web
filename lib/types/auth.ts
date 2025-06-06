// lib/types/auth.ts
import type { User } from "./user";

/**
 * 登录请求体 - 基于 swagger.yaml controllers.LoginRequest
 */
export interface LoginRequest {
  username_or_email: string;
  password: string; // 根据 swagger.yaml controllers.LoginRequest，密码是必填的
}

/**
 * 注册请求体 - 基于 swagger.yaml controllers.RegisterRequest
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string; // 根据 swagger.yaml controllers.RegisterRequest，密码是必填的
}

/**
 * 认证成功响应体
 * 后端直接返回包含 token 和 user 的对象
 */
export interface AuthResponseData {
  token: string;
  user: User;
  message?: string; // 可选的消息字段
}

/**
 * 认证相关的Server Action统一成功响应结构
 */
export interface ActionSuccessResponse<T = AuthResponseData> {
  success: true;
  data: T;
  message?: string;
}

/**
 * 认证相关的Server Action统一错误响应结构
 */
export interface ActionErrorResponse {
  success: false;
  message: string;
  error?: any; // 更详细的错误信息
  code?: number; // HTTP状态码或业务错误码
}

/**
 * Server Action 的通用返回类型
 */
export type ServerActionResponse<TSuccessData = AuthResponseData> =
  | ActionSuccessResponse<TSuccessData>
  | ActionErrorResponse;
