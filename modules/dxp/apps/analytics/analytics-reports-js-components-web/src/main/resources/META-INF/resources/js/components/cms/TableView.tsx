/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayPagination, {Pagination} from '@clayui/pagination';
import ClayPaginationBar from '@clayui/pagination-bar';
import ClayTable from '@clayui/table';
import React, {useMemo, useState} from 'react';

import {MetricType} from '../../types/global';
import {formatDate} from '../../utils/date';
import {toThousands} from '../../utils/math';
import {
	ICurrentVsPreviousChartProps,
	getSelectedHistogram,
} from './current-vs-previous/CurrentVsPreviousChart';

function formatDateForTable(dateStr: string): string {
	const date = new Date(dateStr);
	const formatted = formatDate(date);

	return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const initialTableValues = {
	delta: 10,
	page: 1,
};

const TableView: React.FC<ICurrentVsPreviousChartProps> = ({
	data,
	metricType,
}) => {
	const [delta, setDelta] = useState(initialTableValues.delta);
	const [page, setPage] = useState(initialTableValues.page);

	const title: Partial<Record<MetricType, string>> = {
		[MetricType.Views]: Liferay.Language.get('views'),
		[MetricType.Impressions]: Liferay.Language.get('impressions'),
		[MetricType.Downloads]: Liferay.Language.get('downloads'),
	};

	const histogram = useMemo(() => {
		return getSelectedHistogram(data, metricType);
	}, [data, metricType]);

	const formattedData = useMemo(() => {

		// Pedir ajuda de didi para remover

		if (!histogram) {
			return [];
		}

		return histogram.metrics.map((metric) => ({
			date: formatDateForTable(metric.valueKey),
			value: toThousands(metric.value),
			previous: toThousands(metric.previousValue),
		}));
	}, [histogram]);

	const totalPages = Math.ceil(formattedData.length / delta);

	const displayedItems = useMemo(() => {
		const start = (page - 1) * delta;
		const end = start + delta;

		return formattedData.slice(start, end);
	}, [formattedData, page, delta]);

	// Pedir ajuda de didi para remover

	if (!histogram || !formattedData.length) {
		return (
			<p className="mt-3 text-center text-muted">
				{Liferay.Language.get('no-data-available-for-this-metric')}
			</p>
		);
	}

	return (

		// Tabela principal

		<div>
			<ClayTable hover={false} responsive>
				<ClayTable.Head>
					<ClayTable.Row>
						<ClayTable.Cell headingCell>
							{Liferay.Language.get('date')}
						</ClayTable.Cell>

						<ClayTable.Cell align="right" headingCell>
							{title[metricType]}
						</ClayTable.Cell>

						<ClayTable.Cell align="right" headingCell>
							{Liferay.Language.get('previous-period')}
						</ClayTable.Cell>
					</ClayTable.Row>
				</ClayTable.Head>

				<ClayTable.Body>
					{displayedItems.map((row, index) => (
						<ClayTable.Row key={index}>
							<ClayTable.Cell>{row.date}</ClayTable.Cell>

							<ClayTable.Cell align="right">
								{row.value}
							</ClayTable.Cell>

							<ClayTable.Cell align="right">
								{row.previous}
							</ClayTable.Cell>
						</ClayTable.Row>
					))}
				</ClayTable.Body>
			</ClayTable>

			{/* Dropdown para selecionar os itens por pagina */}

			<div className="align-items-center d-flex justify-content-between mt-3">
				<ClayPaginationBar.DropDown
					items={[10, 20, 30, 50].map((label) => ({
						label: `${label} ${Liferay.Language.get('items')}`,
						onClick: () => {
							setDelta(label);
							setPage(1);
						},
					}))}
					trigger={
						<ClayButton displayType="unstyled">
							{delta} {Liferay.Language.get('items')}

							<ClayIcon symbol="caret-double-l" />
						</ClayButton>
					}
				/>
			</div>

			{/* Pagination luta para lutar amanha */}

			<div className="d-flex justify-content-center mt-3">
				<Pagination>

					{/* Botão anterior */}

					<Pagination.Item
						aria-label="Previous page"
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
					>
						&laquo;
					</Pagination.Item>

					{/* Botões das páginas */}

					{[...Array(totalPages)].map((_, i) => {
						const pageNum = i + 1;

						return (
							<Pagination.Item
								active={page === pageNum}
								key={pageNum}
								onClick={() => setPage(pageNum)}
							>
								{pageNum}
							</Pagination.Item>
						);
					})}

					{/* Botão próximo */}

					<Pagination.Item
						aria-label="Next page"
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}
					>
						&raquo;
					</Pagination.Item>
				</Pagination>
			</div>
		</div>
	);
};

export {TableView};
