import { Router } from 'express';
import { validateRequest } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';

// Controllers
import AuthController, { registerSchema, loginSchema, onboardUserSchema } from '../controllers/authController';
import ProductController, { createProductSchema, updateProductSchema } from '../controllers/productController';
import CustomerController, { createCustomerSchema, updateCustomerSchema, adjustLoyaltySchema } from '../controllers/customerController';
import TransactionController, { createTransactionSchema } from '../controllers/transactionController';
import AIController, { chatAssistantSchema, marketingContentSchema, addKnowledgeSchema } from '../controllers/aiController';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & TEAM ONBOARDING
// ==========================================
router.post('/auth/register', authLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/auth/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/auth/onboard', authenticate, authorize(['OWNER']), validateRequest(onboardUserSchema), AuthController.onboardUser);

// ==========================================
// 2. PRODUCT INVENTORY
// ==========================================
router.get('/products', authenticate, ProductController.getAll);
router.post('/products', authenticate, authorize(['OWNER', 'ADMIN']), validateRequest(createProductSchema), ProductController.create);
router.put('/products/:id', authenticate, authorize(['OWNER', 'ADMIN']), validateRequest(updateProductSchema), ProductController.update);
router.delete('/products/:id', authenticate, authorize(['OWNER']), ProductController.delete);

// ==========================================
// 3. CUSTOMER CRM & LOYALTY
// ==========================================
router.get('/customers', authenticate, CustomerController.getAll);
router.post('/customers', authenticate, validateRequest(createCustomerSchema), CustomerController.create);
router.put('/customers/:id', authenticate, validateRequest(updateCustomerSchema), CustomerController.update);
router.post('/customers/:id/loyalty', authenticate, validateRequest(adjustLoyaltySchema), CustomerController.adjustLoyaltyPoints);

// ==========================================
// 4. SALES & CASHIER POS REGISTER
// ==========================================
router.get('/transactions', authenticate, TransactionController.getAll);
router.get('/transactions/export', authenticate, authorize(['OWNER', 'ADMIN']), TransactionController.export);
router.post('/transactions', authenticate, validateRequest(createTransactionSchema), TransactionController.create);

// ==========================================
// 5. AI MODULES & RAG
// ==========================================
router.post('/ai/chat', authenticate, validateRequest(chatAssistantSchema), AIController.chat);
router.get('/ai/predict-sales', authenticate, authorize(['OWNER']), AIController.getSalesPrediction);
router.get('/ai/insights', authenticate, authorize(['OWNER', 'ADMIN']), AIController.getBusinessInsights);
router.post('/ai/marketing-content', authenticate, validateRequest(marketingContentSchema), AIController.generateMarketingContent);
router.post('/ai/knowledge', authenticate, authorize(['OWNER', 'ADMIN']), validateRequest(addKnowledgeSchema), AIController.addKnowledge);

export default router;
