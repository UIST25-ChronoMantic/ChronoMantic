import "./index.css";
import Papa from "papaparse";
import { useRef, forwardRef, ForwardedRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { setDataset, Dataset, ColumnType } from "../../app/slice/datasetSlice";
import UploadIcon from "../../icons/Upload";
import { datasetApi } from "../../api";
import { setQueryResults, setResults } from "../../app/slice/approximation";
import { Unit } from "../../types/QuerySpec";
import { getUnitBySeconds } from "../../utils/query-spec";

const CsvLoader = forwardRef(function CsvLoader({ onClick }: { onClick?: () => void }, ref: ForwardedRef<HTMLDivElement>) {
	const dispatch = useAppDispatch();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClickLoadIcon = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
			fileInputRef.current.click();
		}
	};

	const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		parseCSV(file);
	};

	const parseCSV = (file: File) => {
		datasetApi.uploadCsvFile(file).then((res) => {
			Papa.parse<Record<string, ColumnType>>(file, {
				header: true,
				dynamicTyping: true,
				complete: (result) => {
					const dataset: Dataset = {
						filename: res.filename,
						data: {},
						timeStampColumn: result.meta.fields?.[0] ?? "",
						timeStampColumnType: Unit.NUMBER,
						valueColumns: result.meta.fields?.slice(1) ?? [],
					};

					let lastTimeStamp = 0;
					let delta = 0;
					result.data.forEach((row) => {
						for (const [key, value] of Object.entries(row)) {
							if (!key || value === null) continue;
							if (!dataset.data[key]) {
								dataset.data[key] = [];
							}
							if (key === dataset.timeStampColumn && typeof value === "string" && !isNaN(new Date(value).getTime())) {
								const timeStamp = new Date(value).getTime();
								delta = timeStamp - lastTimeStamp;
								lastTimeStamp = timeStamp;
								dataset.timeStampColumnType = getUnitBySeconds(Math.abs(delta) / 1000);
							}
							if (delta >= 0) {
								dataset.data[key].push(value);
							} else {
								dataset.data[key].unshift(value);
							}
						}
					});
					dispatch(setDataset(dataset));
					dispatch(setQueryResults({}));
					datasetApi.processDataset({ time_column: dataset.timeStampColumn, value_columns: dataset.valueColumns }).then((res) => {
						dispatch(setResults(res));
					});
				},
				error: (error) => {
					console.error("Error parsing CSV:", error);
				},
			});
		});
	};

	return (
		<div
			ref={ref}
			className="csv-loader"
			onClick={onClick || handleClickLoadIcon}
		>
			<UploadIcon></UploadIcon>
			<input
				ref={fileInputRef}
				type="file"
				accept=".csv"
				className="hidden"
				onChange={handleFileLoad}
			/>
		</div>
	);
});

export default CsvLoader;
