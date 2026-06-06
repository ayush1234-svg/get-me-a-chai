import PaymentPage from "../../components/PaymentPage";

export default async function Username({ params }) {
  const { username } = await params;
  return (
    <>
      <PaymentPage username={username} />
    </>
  );
}
