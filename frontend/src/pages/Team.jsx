const members = [
  { name: 'Sacha Le Moign-Avalos', role: 'Président', bio: 'Fan de D&D', photo: '/team/sacha.jpg' },
  { name: 'Aryan BHOTEY', role: 'Vice-Président', bio: 'Créateur de GCC', photo: '/team/aryan.jpeg' },
  { name: '/!\\', role: 'Trésorier', bio: 'Place vacante', photo: '/team/aryan.jpeg' },
];

function Team() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Qui sommes-nous ?</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Le bureau du BDE Epitech, à votre service.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
              <img src={member.photo} alt={member.name} className="w-24 h-24 rounded-full object-cover mb-3" />
              <h2 className="font-semibold text-lg text-slate-900 dark:text-white">{member.name}</h2>
              <p className="text-sm text-blue-500 mb-2">{member.role}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Team;