export const metadata = {
  title: '상품 주문 가이드',
};

export default function OrderGuidePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">상품 주문 가이드</h1>
      <section className="mb-8 space-y-2">
        <p>주문 방법과 절차에 대한 안내입니다.</p>
        <p>원하는 상품을 선택하고 옵션을 지정한 후 주문해 주세요.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">FAQ</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Q. 배송 기간은 얼마나 걸리나요?</p>
          <p>A. 보통 3~5일이 소요됩니다.</p>
        </div>
      </section>
    </main>
  );
}
