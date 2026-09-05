import Navbar from "../../components/Navbar.jsx";

// TODO: List of posted entries + manual entry form (journal, date, reference, lines with debit/credit)
// Reference implementation to copy from: pages/Contacts/ContactList.jsx (list) and ContactForm.jsx (form)
export default function JournalEntries() {
  return (
    <div>
      <Navbar />
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-4">JournalEntries</h1>
        <p className="text-gray-500 text-sm">TODO: List of posted entries + manual entry form (journal, date, reference, lines with debit/credit)</p>
      </div>
    </div>
  );
}
