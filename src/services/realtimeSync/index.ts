// Export all realtime sync services and utilities
export { realtimeSyncService } from './syncService';
export { dataListenersService } from './dataListeners';
export { realtimeErrorHandler } from './errorHandler';
export { mobileSyncService } from './mobileSyncService';

// Export types
export type {
  SyncEventType,
  SyncCallback,
  TableSubscription
} from './syncService';

export type {
  PropertyData,
  LeaseData,
  PaymentData,
  UserProfileData,
  CriticalDataType
} from './dataListeners';

export type {
  ErrorCategory,
  ErrorSeverity,
  ErrorReport,
  ErrorCallback
} from './errorHandler';

// Convenience function to initialize all sync services
export const initializeRealtimeSync = async () => {
  try {
    console.log('🚀 Initializing Realtime Sync Services...');
    
    // Initialize mobile sync service first (handles network/app state)
    await mobileSyncService.initialize();
    
    // Initialize the main sync service
    await realtimeSyncService.initialize();
    
    // Initialize data listeners
    await dataListenersService.initializeAllListeners();
    
    console.log('✅ Realtime Sync Services initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Realtime Sync Services:', error);
    const { realtimeErrorHandler } = await import('./errorHandler');
    realtimeErrorHandler.reportError(
      'connection',
      'critical',
      'Failed to initialize Realtime Sync Services',
      error
    );
    return false;
  }
};

// Convenience function to cleanup all sync services
export const cleanupRealtimeSync = async () => {
  try {
    console.log('🧹 Cleaning up Realtime Sync Services...');
    
    // Stop data listeners
    await dataListenersService.stopAllListeners();
    
    // Cleanup sync service
    realtimeSyncService.cleanup();
    
    // Cleanup mobile sync service
    await mobileSyncService.cleanup();
    
    console.log('✅ Realtime Sync Services cleaned up successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to cleanup Realtime Sync Services:', error);
    const { realtimeErrorHandler } = await import('./errorHandler');
    realtimeErrorHandler.reportError(
      'connection',
      'medium',
      'Failed to cleanup Realtime Sync Services',
      error
    );
    return false;
  }
};