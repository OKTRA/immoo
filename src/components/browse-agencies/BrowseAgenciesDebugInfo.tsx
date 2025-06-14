
interface BrowseAgenciesDebugInfoProps {
  isLoading: boolean;
  error: any;
  rawAgenciesCount: number;
  filteredAgenciesCount: number;
}

export default function BrowseAgenciesDebugInfo({
  isLoading,
  error,
  rawAgenciesCount,
  filteredAgenciesCount
}: BrowseAgenciesDebugInfoProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Error: {error ? String(error) : 'None'}</p>
      <p>Raw agencies count: {rawAgenciesCount}</p>
      <p>Filtered agencies count: {filteredAgenciesCount}</p>
    </div>
  );
}
