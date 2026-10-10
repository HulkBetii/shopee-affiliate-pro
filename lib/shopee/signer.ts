import crypto from 'crypto';
import { ShopeeSignResult } from './types';

/**
 * Tạo Header Authorization có ký số SHA256 theo chuẩn Shopee Open API.
 * Công thức:
 *   signatureBase = appId + timestamp + payload + secretKey
 *   signature = SHA256(signatureBase) in hex lowercase
 *
 * @param appId Mã định danh ứng dụng Shopee
 * @param secretKey Khóa bí mật của ứng dụng Shopee
 * @param payload Toàn bộ nội dung body JSON request
 * @param customTimestamp Dùng cho testing/mock (nếu không truyền sẽ lấy thời gian hiện tại)
 */
export function buildShopeeAuth(
  appId: string,
  secretKey: string,
  payload: string,
  customTimestamp?: number
): ShopeeSignResult {
  if (!appId || !secretKey) {
    throw new Error('Shopee Auth Error: appId and secretKey must not be empty.');
  }

  const timestamp = customTimestamp ?? Math.floor(Date.now() / 1000);
  const signatureBase = `${appId}${timestamp}${payload}${secretKey}`;
  const signature = crypto.createHash('sha256').update(signatureBase, 'utf8').digest('hex');

  return {
    timestamp,
    signature,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
    },
  };
}

/**
 * Kiểm tra tính hợp lệ của chữ ký (dùng cho webhook hoặc audit).
 */
export function verifyShopeeSignature(
  appId: string,
  secretKey: string,
  payload: string,
  timestamp: number,
  expectedSignature: string
): boolean {
  const signatureBase = `${appId}${timestamp}${payload}${secretKey}`;
  const computed = crypto.createHash('sha256').update(signatureBase, 'utf8').digest('hex');
  return computed.toLowerCase() === expectedSignature.toLowerCase();
}
