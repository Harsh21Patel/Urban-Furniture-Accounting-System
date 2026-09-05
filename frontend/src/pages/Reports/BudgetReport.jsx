import Navbar from "../../components/Navbar.jsx";

// TODO: Fetch reportsApi.budgetReport(), render committed vs achieved per analytic account
// Reference implementation to copy from: pages/Contacts/ContactList.jsx (list) and ContactForm.jsx (form)
export default function BudgetReport() {
  return (
    <div>
      <Navbar />
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-4">BudgetReport</h1>
        <p className="text-gray-500 text-sm">TODO: Fetch reportsApi.budgetReport(), render committed vs achieved per analytic account</p>
      </div>
    </div>
  );
}
