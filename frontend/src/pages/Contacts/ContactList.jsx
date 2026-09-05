import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../api/endpoints.js';
import DataTable from '../../components/DataTable.jsx';
import Navbar from '../../components/Navbar.jsx';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Phone' },
];

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    contactsApi.list().then((res) => setContacts(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">Contacts</h1>
          <button
            onClick={() => navigate('/contacts/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            New
          </button>
        </div>
        <DataTable columns={columns} rows={contacts} onRowClick={(c) => navigate(`/contacts/${c.id}`)} />
      </div>
    </div>
  );
}
