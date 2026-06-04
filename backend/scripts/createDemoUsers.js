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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
// Load env variables
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key. Make sure .env is configured correctly in the backend folder.');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const roles = [
    'admin', 'super_admin', 'owner', 'manager', 'hr_manager',
    'warehouse_manager', 'accountant', 'vendor_manager',
    'production_manager', 'store_keeper', 'sales_executive'
];
async function seedUsers() {
    console.log('Seeding role-based demo users...');
    for (const role of roles) {
        const email = `${role}@sriganga.com`;
        const password = `${role.replace('_', '')}@123`;
        const fullName = role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Demo';
        try {
            // 1. Create the user in auth.users
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    role: role,
                }
            });
            if (authError) {
                if (authError.message.includes('already registered')) {
                    console.log(`User ${email} already exists. Skipping creation...`);
                    // Let's ensure the user role table is synced anyway, but we need the user ID
                    const { data: searchData, error: searchError } = await supabase.auth.admin.listUsers();
                    if (!searchError && searchData?.users) {
                        const existingUser = searchData.users.find(u => u.email === email);
                        if (existingUser) {
                            // Ensure they are approved in the user_roles table
                            const { error: roleError } = await supabase
                                .from('user_roles')
                                .upsert({ user_id: existingUser.id, role: role, is_approved: true }, { onConflict: 'user_id' });
                            if (roleError)
                                console.error(`Error upserting role for existing ${email}:`, roleError);
                        }
                    }
                    continue;
                }
                console.error(`Error creating ${email}:`, authError.message);
                continue;
            }
            console.log(`Successfully created user: ${email} | Password: ${password}`);
            // 2. Ensure they are approved in user_roles
            if (authData.user) {
                const { error: roleError } = await supabase
                    .from('user_roles')
                    .insert([
                    { user_id: authData.user.id, role: role, is_approved: true }
                ]);
                if (roleError) {
                    console.error(`Created user ${email} but failed to insert into user_roles:`, roleError.message);
                }
                else {
                    console.log(`  -> Role '${role}' approved in user_roles table.`);
                }
            }
        }
        catch (e) {
            console.error(`Unexpected error for ${email}:`, e);
        }
    }
    console.log('\n✅ Demo users seeding completed!');
    console.log('Login credentials format:');
    console.log('Email: [role]@sriganga.com');
    console.log('Password: [role(no underscores)]@123');
}
seedUsers();
