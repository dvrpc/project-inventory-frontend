import SearchMultiSelect from '@components/Select/SearchMultiSelect';
import Select from '@components/Select/Select';

export default function Filters() {
  return (
    <div className="flex gap-4">
      <SearchMultiSelect
        options={[]}
        values={[]}
        onChange={() => {}}
        placeholder="Select geographies..."
        className="rounded-xl h-10 w-100"
      />
      <SearchMultiSelect
        options={[]}
        values={[]}
        onChange={() => {}}
        placeholder="Select keywords..."
        className="rounded-xl w-100"
      />
      <Select
        options={[]}
        value={null}
        onChange={() => {}}
        placeholder="Select category..."
        className="rounded-xl w-50"
      />
    </div>
  );
}
