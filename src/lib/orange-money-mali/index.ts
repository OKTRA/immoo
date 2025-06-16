/**
 * Orange Money Mali Payment Module - Portable and Reusable
 * 
 * This module can be easily integrated into any TypeScript/JavaScript project
 * Simply copy this folder and configure your API keys
 * 
 * Usage:
 * 1. Configure your Orange Money API credentials
 * 2. Initialize the Orange Money client
 * 3. Create payments and handle callbacks
 */

export * from './types';
export * from './client';
export * from './config';
export * from './utils';
export { default as OrangeMoneyMaliClient } from './client'; 