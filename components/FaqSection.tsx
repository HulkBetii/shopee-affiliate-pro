'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Heart } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Website này có mất phí sử dụng không?',
    answer: 'Không hề bạn nhé! Bạn có thể sử dụng góc nhỏ này để lấy link mua hàng hoàn toàn miễn phí bất cứ lúc nào.',
  },
  {
    question: 'Mình có cần tạo tài khoản hay đăng nhập không?',
    answer: 'Không cần đâu nha. Bạn chỉ cần sao chép link sản phẩm trên Shopee và dán vào ô tạo link là có thể mua ngay.',
  },
  {
    question: 'Đây có phải link tiếp thị liên kết (affiliate) không?',
    answer: 'Đúng rồi, khi tạo link thành công, link sẽ gắn mã đối tác của mẹ Ngân. Mẹ Ngân có thể nhận được một phần hoa hồng nhỏ từ Shopee mà không làm tăng giá món hàng của bạn, giúp hai mẹ con có thêm kinh phí duy trì kênh chia sẻ.',
  },
  {
    question: 'Website có mở thẳng ứng dụng Shopee được không?',
    answer: 'Có chứ! Hệ thống được tối ưu để mở thẳng App Shopee trên điện thoại của bạn (cả iPhone và Android), giúp bạn giữ nguyên các voucher Freeship, Shopee Xu và thanh toán an toàn.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full max-w-xl text-left">
      <div className="mb-3 text-center sm:text-left">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#725541]">
          Những Câu Hỏi Thường Gặp ♡
        </h3>
        <p className="text-xs text-[#8E7764]">
          Giải đáp nhanh một số thắc mắc của các mẹ khi sử dụng website
        </p>
      </div>

      <div className="space-y-2">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="card-warm overflow-hidden rounded-2xl border border-[#D6BDA5]/60 bg-[#FFFDF8] transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left font-semibold text-xs sm:text-sm text-[#725541] hover:text-[#A68165] transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#A68165] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-[#D6BDA5]/30 bg-[#F8F0E5]/40 px-3.5 py-3 sm:px-4 text-xs text-[#8E7764] leading-relaxed animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
