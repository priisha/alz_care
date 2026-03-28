import { useState } from 'react';

export default function Login({ supabase }: { supabase: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">AlzCare Login</h2>
        <input className="w-full p-2 mb-4 border border-gray-300 rounded" 
               type="email" placeholder="Caregiver Email" onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-2 mb-4 border border-gray-300 rounded" 
               type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700" 
                onClick={handleLogin}>Log In</button>
      </div>
    </div>
  );
}