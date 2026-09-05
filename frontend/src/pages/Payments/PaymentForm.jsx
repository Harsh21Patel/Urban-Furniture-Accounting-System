import Navbar from "../../components/Navbar.jsx";

// TODO: Register payment against Invoice or Vendor Bill — amount + method (Cash/Bank)
// Reference implementation to copy from: pages/Contacts/ContactList.jsx (list) and ContactForm.jsx (form)
export default function PaymentForm() {
  return (
    <div>
      <Navbar />
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-4">PaymentForm</h1>
        <p className="text-gray-500 text-sm">TODO: Register payment against Invoice or Vendor Bill — amount + method (Cash/Bank)</p>
      </div>
    </div>
  );
}
