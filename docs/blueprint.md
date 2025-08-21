# **App Name**: PINTO (핀토) – 커스텀 굿즈 프린트 커머스

## Core Features:

- Product Customization: 상품 상세에 옵션(사이즈/색/텍스트 등)과 미리보기 프리뷰(간이 캔버스) 제공. 에디터에서 생성한 이미지 → Storage 업로드 → cart_item.preview_image로 저장
- Shopping Cart & Checkout (모의결제): 장바구니 추가/수정/삭제, 주문 요약, 모의 결제 성공/실패 분기
- Review & Like Count: 각 상품 카드/상세에 DB 실시간 `review_count`, `like_count` 표기 (하드코딩/더미 금지). 좋아요 토글 시 트랜잭션 + 서버 집계
- Admin Product Management: 판매자/관리자만 상품 CRUD (본인 소유 상품만 수정/삭제)
- Multi-Language Support: name/description 다국어 필드 + UI 문구 i18n(JSON)

## Style Guidelines:

- Primary: Black
- Background: White
- Font: Google Fonts 'Poppins'
- 카드/리스트: 모바일 우선 반응형
- 카테고리/서브카테고리용 간결한 아이콘 사용(서로 구분 명확)