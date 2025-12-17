import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, X, Search, Video } from 'lucide-react';

const ManageTheaters = () => {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTheater, setEditingTheater] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        image: '', // Optional image URL for theater
        screens: [] // keeping it simple for now, maybe just a number or default config
    });

    const fetchTheaters = async () => {
        try {
            const { data } = await api.get('/theaters');
            setTheaters(data);
        } catch (error) {
            console.error('Failed to fetch theaters:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTheaters();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTheater) {
                await api.put(`/theaters/${editingTheater._id}`, formData);
            } else {
                await api.post('/theaters', formData);
            }
            fetchTheaters();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Failed to save theater');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this theater?')) return;
        try {
            await api.delete(`/theaters/${id}`);
            fetchTheaters();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete theater');
        }
    };

    const openModal = (theater = null) => {
        if (theater) {
            setEditingTheater(theater);
            setFormData(theater);
        } else {
            setEditingTheater(null);
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            location: '',
            image: '',
            screens: []
        });
    };

    const filteredTheaters = theaters.filter(theater =>
        theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theater.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Theaters</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Theater
                </button>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search theaters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTheaters.map((theater) => (
                        <div key={theater._id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex flex-col group">
                            {/* Placeholder image if none provided */}
                            <div className="h-40 bg-gray-800 flex items-center justify-center relative overflow-hidden">
                                {theater.image ? (
                                    <img src={theater.image} alt={theater.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Video className="w-12 h-12 text-gray-600" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => openModal(theater)}
                                        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(theater._id)}
                                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 flex-1">
                                <h3 className="text-xl font-bold mb-1">{theater.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{theater.location}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="bg-gray-800 px-2 py-1 rounded">
                                        {theater.screens?.length || 0} Screens
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{editingTheater ? 'Edit Theater' : 'Add New Theater'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Theater Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    className="w-full bg-black border border-gray-800 rounded-lg p-3 focus:border-primary focus:outline-none"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary rounded-lg font-medium hover:bg-red-700 transition"
                                >
                                    {editingTheater ? 'Update Theater' : 'Add Theater'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTheaters;
