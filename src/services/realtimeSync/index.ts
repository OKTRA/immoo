// Export all realtime sync services and utilities via getters to avoid circular dependencies
export const getRealtimeSyncService = async () => {
  const { realtimeSyncService } = await import('./syncService');
  return realtimeSyncService;
};

export const getDataListenersService = async () => {
  const { dataListenersService } = await import('./dataListeners');
  return dataListenersService;
};

export const getRealtimeErrorHandler = async () => {
  const { realtimeErrorHandler } = await import('./errorHandler');
  return realtimeErrorHandler;
};

export const getMobileSyncService = async () => {
  const { mobileSyncService } = await import('./mobileSyncService');
  return mobileSyncService;
};

// Export types that exist
export type {
  SyncEventType,
  SyncCallback
} from './syncService';

export type {
  Property,
  Lease,
  Payment,
  UserProfile
} from './dataListeners';

export type {
  ErrorCategory,
  ErrorSeverity
} from './errorHandler';

// Convenience function to initialize all sync services
export const initializeRealtimeSync = async () => {
  try {
    console.log('🚀 Initializing Realtime Sync Services...');
    
    // Initialize mobile sync service first (handles network/app state)
    const { mobileSyncService } = await import('./mobileSyncService');
    await mobileSyncService.initialize();
    
    // Initialize the main sync service
    const { realtimeSyncService } = await import('./syncService');
    await realtimeSyncService.initialize();
    
    // Initialize data listeners
    const { dataListenersService } = await import('./dataListeners');
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
    const { dataListenersService } = await import('./dataListeners');
    await dataListenersService.stopAllListeners();
    
    // Cleanup sync service
    const { realtimeSyncService } = await import('./syncService');
    realtimeSyncService.unsubscribeAll();
    
    // Cleanup mobile sync service
    const { mobileSyncService } = await import('./mobileSyncService');
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