"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const activities_routes_1 = __importDefault(require("./routes/activities.routes"));
const memos_routes_1 = __importDefault(require("./routes/memos.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['https://epi-center-one.vercel.app', 'http://localhost:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/activities', activities_routes_1.default);
app.use('/api/memos', memos_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use((err, req, res, next) => {
    console.error('ERREUR:', err.message);
    res.status(500).json({ message: err.message });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
