const members = [
  {
    name: 'Sacha Le Moign-Avalos',
    role: 'Président',
    bio: 'Fan de D&D',
    photo: 'https://via.placeholder.com/150',
  },
  {
    name: 'Aryan BHOTEY',
    role: 'Vice-Président',
    bio: 'Créateur de GCC',
    photo: 'https://via.placeholder.com/150',
  },
  {
    name: '/!\\',
    role: 'Trésorier',
    bio: 'place vacante',
    photo: 'https://via.placeholder.com/150',
  },
];

function Team() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Qui sommes-nous ?</h1>
      <p className="text-gray-600 mb-8">Le bureau du BDE Epitech, à votre service.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {members.map((member, index) => (
          <div key={index} className="border rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
            <img
              src={member.photo}
              alt={member.name}
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
            <h2 className="font-semibold text-lg">{member.name}</h2>
            <p className="text-sm text-blue-600 mb-2">{member.role}</p>
            <p className="text-sm text-gray-600">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;