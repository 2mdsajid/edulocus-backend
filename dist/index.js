"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const tests_routes_1 = __importDefault(require("./tests/tests.routes"));
const questions_routes_1 = __importDefault(require("./questions/questions.routes"));
const users_routes_1 = __importDefault(require("./users/users.routes"));
dotenv.config();
if (!process.env.PORT) {
    console.log("Please specify port number ");
    process.exit(1);
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // to avoid cross-origin blocking
app.use(express_1.default.json());
app.use("/tests", tests_routes_1.default);
app.use("/users", users_routes_1.default);
app.use("/questions", questions_routes_1.default);
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({
            message: 'Hello, please do not cause unnecessary API calls',
        });
    }
    catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: error.message });
    }
}));
const PORT = parseInt(process.env.PORT, 10) || 3002;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
