/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import {ContextProvider} from './Context';
import {CheckPermissions} from './components/cms/CheckPermissions';
import GlobalFilters from './components/cms/GlobalFilters';
import {Metrics} from './components/cms/Metrics';
import {AssetMetrics} from './components/cms/asset-metrics/AssetMetrics';

import '../css/cms_performance.scss';
interface ICMSPerformanceProps extends React.HTMLAttributes<HTMLElement> {
	assetId?: number | null;
	depotEntryId?: number | null;
}

const CMSPerformance: React.FC<ICMSPerformanceProps> = ({
	assetId,
	depotEntryId,
}) => {
	return (
		<div className="cms-performance">
			<CheckPermissions depotEntryId={String(depotEntryId)}>
				<ContextProvider assetId={String(assetId)}>
					<GlobalFilters />

					<Metrics />

					<AssetMetrics />
				</ContextProvider>
			</CheckPermissions>
		</div>
	);
};

export default CMSPerformance;
