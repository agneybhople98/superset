/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { PureComponent, ReactNode } from 'react';
import rison from 'rison';
import {
  isDefined,
  JsonResponse,
  styled,
  SupersetClient,
  t,
} from '@superset-ui/core';

import { withTheme, Theme } from '@emotion/react';
import { getUrlParam } from 'src/utils/urlUtils';
import { FilterPlugins, URL_PARAMS } from 'src/constants';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { AsyncSelect, Button, Steps } from '@superset-ui/core/components';
import withToasts from 'src/components/MessageToasts/withToasts';

import VizTypeGallery, {
  MAX_ADVISABLE_VIZ_GALLERY_WIDTH,
} from 'src/explore/components/controls/VizTypeControl/VizTypeGallery';
import { findPermission } from 'src/utils/findPermission';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import getBootstrapData from 'src/utils/getBootstrapData';
import {
  Dataset,
  DatasetSelectLabel,
} from 'src/features/datasets/DatasetSelectLabel';
import { Icons } from '@superset-ui/core/components/Icons';

export interface ChartCreationProps extends RouteComponentProps {
  user: UserWithPermissionsAndRoles;
  addSuccessToast: (arg: string) => void;
  theme: Theme;
}

export type ChartCreationState = {
  datasource?: { label: string | ReactNode; value: string };
  datasetName?: string | string[] | null;
  vizType: string | null;
  canCreateDataset: boolean;
  docUrl: string;
};

const ESTIMATED_NAV_HEIGHT = 56;
const ELEMENTS_EXCEPT_VIZ_GALLERY = ESTIMATED_NAV_HEIGHT + 250;

const bootstrapData = getBootstrapData();
// Define the base URL and dataset to URL mapping
const DOCS_BASE_URL = (getBootstrapData().common.feature_flags as Record<string, unknown>).CLIENT_DOCS_BASE_URL as string ?? 'https://docs.riaproducts.com/rda/3.x.x/docs/subject-areas';

const DATASET_URLS: Record<string, string> = {
  // Account
  acct_obj: `${DOCS_BASE_URL}/account/#acct_obj`,
  acct_alert_obj: `${DOCS_BASE_URL}/account/#acct_alert_obj`,
  acct_apay_obj: `${DOCS_BASE_URL}/account/#acct_apay_obj`,
  acct_msg_obj: `${DOCS_BASE_URL}/account/#acct_msg_obj`,
  adm_rvw_sch_obj: `${DOCS_BASE_URL}/account/#adm_rvw_sch_obj`,
  cr_rat_hist_obj: `${DOCS_BASE_URL}/account/#cr_rat_hist_obj`,
  ncd_obj: `${DOCS_BASE_URL}/account/#ncd_obj`,
  per_addr_ovrd_obj: `${DOCS_BASE_URL}/account/#per_addr_ovrd_obj`,
  ss_addr_phone_ovrd_obj: `${DOCS_BASE_URL}/account/#ss_addr_phone_ovrd_obj`,
  ss_cont_ovrd_obj: `${DOCS_BASE_URL}/account/#ss_cont_ovrd_obj`,

  // Accrual
  accrual_obj: `${DOCS_BASE_URL}/accrual/#accrual_obj`,
  accrual_dtls_obj: `${DOCS_BASE_URL}/accrual/#accrual_dtls_obj`,

  // Address
  address_obj: `${DOCS_BASE_URL}/address/#address_obj`,
  address_log_obj: `${DOCS_BASE_URL}/address/#address_log_obj`,

  // Adjustment Type
  adj_type_obj: `${DOCS_BASE_URL}/adjustment-type/#adj_type_obj`,

  // Adjustment
  adj_obj: `${DOCS_BASE_URL}/adjustment/#adj_obj`,
  adj_apreq_obj: `${DOCS_BASE_URL}/adjustment/#adj_apreq_obj`,
  adj_calc_ln_obj: `${DOCS_BASE_URL}/adjustment/#adj_calc_ln_obj`,

  // Bill Charge
  bill_chg_obj: `${DOCS_BASE_URL}/bill-charge/#bill_chg_obj`,
  bill_chg_line_obj: `${DOCS_BASE_URL}/bill-charge/#bill_chg_line_obj`,
  bchg_read_obj: `${DOCS_BASE_URL}/bill-charge/#bchg_read_obj`,

  // Bill Cycle
  bill_cyc_obj: `${DOCS_BASE_URL}/bill-cycle/#bill_cyc_obj`,

  // Bill Segment
  bseg_obj: `${DOCS_BASE_URL}/bill-segment/#bseg_obj`,
  bseg_calc_ln_obj: `${DOCS_BASE_URL}/bill-segment/#bseg_calc_ln_obj`,
  bseg_item_obj: `${DOCS_BASE_URL}/bill-segment/#bseg_item_obj`,
  bseg_msg_obj: `${DOCS_BASE_URL}/bill-segment/#bseg_msg_obj`,
  bseg_read_obj: `${DOCS_BASE_URL}/bill-segment/#bseg_read_obj`,

  // Bill
  bill_obj: `${DOCS_BASE_URL}/bill/#bill_obj`,
  bill_msg_obj: `${DOCS_BASE_URL}/bill/#bill_msg_obj`,
  bill_routing_obj: `${DOCS_BASE_URL}/bill/#bill_routing_obj`,
  bill_sa_obj: `${DOCS_BASE_URL}/bill/#bill_sa_obj`,

  // CIS Division
  cis_division_obj: `${DOCS_BASE_URL}/cis-division/#cis_division_obj`,
  cis_div_rtyp_obj: `${DOCS_BASE_URL}/cis-division/#cis_div_rtyp_obj`,
  cis_div_seq_char_obj: `${DOCS_BASE_URL}/cis-division/#cis_div_seq_char_obj`,
  div_td_role_obj: `${DOCS_BASE_URL}/cis-division/#div_td_role_obj`,

  // Data Access
  dar_obj: `${DOCS_BASE_URL}/data-access/#dar_obj`,
  dar_usr_acc_grp_obj: `${DOCS_BASE_URL}/data-access/#dar_usr_acc_grp_obj`,

  // Deposit Control
  deposit_ctl_obj: `${DOCS_BASE_URL}/deposit-control/#deposit_ctl_obj`,

  // Deposit Tender Control
  dep_tndr_ctl_stg_obj: `${DOCS_BASE_URL}/deposit-tender-control/#dep_tndr_ctl_stg_obj`,

  // Distribution Code
  distr_code_obj: `${DOCS_BASE_URL}/distribution-code/#dist_cd_obj`,

  // External Lookup
  f1_ext_lookup_obj: `${DOCS_BASE_URL}/external-lookup/#f1_ext_lookup_obj`,

  // Financial Transaction
  ft_obj: `${DOCS_BASE_URL}/financial-transaction/#ft_obj`,
  ft_proc_obj: `${DOCS_BASE_URL}/financial-transaction/#ft_proc_obj`,

  // General Ledger Division
  gl_division_obj: `${DOCS_BASE_URL}/general-ledger-division/#gl_division_obj`,

  // Member
  membership_obj: `${DOCS_BASE_URL}/member/#membership_obj`,
  membership_per_obj: `${DOCS_BASE_URL}/member/#membership_per_obj`,
  membership_sa_obj: `${DOCS_BASE_URL}/member/#membership_sa_obj`,

  // Payment Event
  apay_obj: `${DOCS_BASE_URL}/payment-event/#apay_obj`,
  pay_evt_obj: `${DOCS_BASE_URL}/payment-event/#pay_evt_obj`,
  pay_tndr_obj: `${DOCS_BASE_URL}/payment-event/#pay_tndr_obj`,

  // Payment
  pay_obj: `${DOCS_BASE_URL}/payment/#pay_obj`,
  pay_excp_obj: `${DOCS_BASE_URL}/payment/#pay_excp_obj`,

  // Person
  per_obj: `${DOCS_BASE_URL}/person/#per_obj`,
  per_addr_seas_obj: `${DOCS_BASE_URL}/person/#per_addr_seas_obj`,
  per_contdet_obj: `${DOCS_BASE_URL}/person/#per_contdet_obj`,
  per_ss_payopt_obj: `${DOCS_BASE_URL}/person/#per_ss_payopt_obj`,

  // Policy Plan
  policy_plan_obj: `${DOCS_BASE_URL}/policy-plan/#policy_plan_obj`,

  // Policy
  policy_obj: `${DOCS_BASE_URL}/policy/#policy_obj`,
  policy_log_obj: `${DOCS_BASE_URL}/policy/#policy_obj`,

  // Price Item
  priceitem_obj: `${DOCS_BASE_URL}/price-item/#priceitem_obj`,

  // Service Agreement
  sa_obj: `${DOCS_BASE_URL}/service-agreement/#sa_obj`,
  sa_cop_obj: `${DOCS_BASE_URL}/service-agreement/#sa_cop_obj`,
  sa_sp_obj: `${DOCS_BASE_URL}/service-agreement/#sa_sp_obj`,
  bill_scnr_obj: `${DOCS_BASE_URL}/service-agreement/#bill_scnr_obj`,
  nbb_obj: `${DOCS_BASE_URL}/service-agreement/#nbb_obj`,

  // Tender Control
  tndr_ctl_obj: `${DOCS_BASE_URL}/tender-control/#tndr_ctl_obj`,
  tndr_end_bal_obj: `${DOCS_BASE_URL}/tender-control/#tndr_end_bal_obj`,

  // Tender Source
  tndr_src_obj: `${DOCS_BASE_URL}/tender-source/#tndr_src_obj`,

  // Tender Type
  tndr_type_obj: `${DOCS_BASE_URL}/tender-type/#tndr_type_obj`,
};

const denyList: string[] = (
  bootstrapData.common.conf.VIZ_TYPE_DENYLIST || []
).concat(Object.values(FilterPlugins));

const StyledContainer = styled.div`
  ${({ theme }) => `
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    max-width: ${MAX_ADVISABLE_VIZ_GALLERY_WIDTH}px;
    max-height: calc(100vh - ${ESTIMATED_NAV_HEIGHT}px);
    border-radius: ${theme.borderRadius}px;
    background-color: ${theme.colorBgContainer};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${theme.padding}px;
    padding-right: ${theme.padding}px;
    padding-bottom: ${theme.padding}px;

    h3 {
      padding-bottom: ${theme.paddingSM}px;
    }

    & .dataset {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: ${theme.marginMD}px;

      & > div {
        min-width: 200px;
        width: 300px;
      }

      & > span {
        color: ${theme.colorText};
        margin-left: ${theme.margin}px;
      }
    }

    & .viz-gallery {
      border: 1px solid ${theme.colorBorder};
      border-radius: ${theme.borderRadius}px;
      margin: ${theme.marginXXS}px 0px;
      max-height: calc(100vh - ${ELEMENTS_EXCEPT_VIZ_GALLERY}px);
      flex: 1;
    }

    & .footer {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;

      & > span {
        color: ${theme.colorText};
        margin-right: ${theme.margin}px;
      }
    }

    /* The following extra ampersands (&&&&) are used to boost selector specificity */

    &&&& .ant-steps-item-tail {
      display: none;
    }

    &&&& .ant-steps-item-icon {
      margin-right: ${theme.marginXS}px;
      width: ${theme.sizeUnit * 5}px;
      height: ${theme.sizeUnit * 5}px;
      line-height: ${theme.sizeUnit * 5}px;
    }

    &&&& .ant-steps-item-title {
      line-height: ${theme.sizeUnit * 5}px;
    }

    &&&& .ant-steps-item-content {
      overflow: unset;

      .ant-steps-item-description {
        margin-top: ${theme.sizeUnit}px;
        padding-bottom: ${theme.sizeUnit}px;
      }
    }

    &&&& .ant-tooltip-open {
      display: inline;
    }
  `}
`;

const StyledStepTitle = styled.span`
  ${({ theme: { fontSize, fontWeightStrong } }) => `
      font-size: ${fontSize}px;
      font-weight: ${fontWeightStrong};
    `}
`;

const StyledStepDescription = styled.div`
  ${({ theme }) => `
    margin-top: ${theme.margin}px;
    margin-bottom: ${theme.marginSM}px;
    margin-left: ${theme.marginMD}px;
  `}
`;

export class ChartCreation extends PureComponent<
  ChartCreationProps,
  ChartCreationState
> {
  constructor(props: ChartCreationProps) {
    super(props);
    this.state = {
      vizType: null,
      canCreateDataset: findPermission(
        'can_write',
        'Dataset',
        props.user.roles,
      ),
      docUrl: 'https://docs.riaproducts.com/rda/3.x.x/docs/web-application/charts/',
    };

    this.changeDatasource = this.changeDatasource.bind(this);
    this.changeVizType = this.changeVizType.bind(this);
    this.gotoSlice = this.gotoSlice.bind(this);
    this.loadDatasources = this.loadDatasources.bind(this);
    this.onVizTypeDoubleClick = this.onVizTypeDoubleClick.bind(this);
    console.log("DOCS_BASE_URL ==>", DOCS_BASE_URL);
    console.log("Direct DOCS_BASE_URL from Feature Flag ==>", (getBootstrapData().common.feature_flags as Record<string, unknown>).CLIENT_DOCS_BASE_URL as string);
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.search).get('dataset');
    if (params) {
      this.loadDatasources(params, 0, 1).then(r => {
        const datasource = r.data[0];
        this.setState({ datasource });
      });
      this.props.addSuccessToast(t('The dataset has been saved'));
    }
  }

  exploreUrl() {
    const dashboardId = getUrlParam(URL_PARAMS.dashboardId);
    let url = `/explore/?viz_type=${this.state.vizType}&datasource=${this.state.datasource?.value}`;
    if (isDefined(dashboardId)) {
      url += `&dashboard_id=${dashboardId}`;
    }
    return url;
  }

  gotoSlice() {
    this.props.history.push(this.exploreUrl());
  }

  changeDatasource(datasource: { label: string | ReactNode; value: string }) {
    const extractedValue = datasource.value.split("__").pop()?.toLowerCase() || '';
    
    // Get the URL for the selected dataset or fallback to default
    const docUrl = DATASET_URLS[extractedValue] || this.state.docUrl;

    // Update state with both datasource and docUrl
    this.setState({ 
      datasource,
      docUrl
    });
  }


  changeVizType(vizType: string | null) {
    this.setState({ vizType });
  }

  isBtnDisabled() {
    return !(this.state.datasource?.value && this.state.vizType);
  }

  onVizTypeDoubleClick() {
    if (!this.isBtnDisabled()) {
      this.gotoSlice();
    }
  }

  loadDatasources(search: string, page: number, pageSize: number) {
    const query = rison.encode({
      columns: [
        'id',
        'table_name',
        'datasource_type',
        'database.database_name',
        'schema',
      ],
      filters: [{ col: 'table_name', opr: 'ct', value: search }],
      page,
      page_size: pageSize,
      order_column: 'table_name',
      order_direction: 'asc',
    });
    return SupersetClient.get({
      endpoint: `/api/v1/dataset/?q=${query}`,
    }).then((response: JsonResponse) => {
      const list: {
        id: number;
        label: string | ReactNode;
        value: string;
      }[] = response.json.result.map((item: Dataset) => ({
        id: item.id,
        value: `${item.id}__${item.datasource_type}__${item.table_name}`,
        label: DatasetSelectLabel(item),
        customLabel: item.table_name
      }));
      return {
        data: list,
        totalCount: response.json.count,
      };
    });
  }

  render() {
    const { theme } = this.props;
    const isButtonDisabled = this.isBtnDisabled();
    const VIEW_INSTRUCTIONS_TEXT = t('view instructions');
    const datasetHelpText = this.state.canCreateDataset ? (
      <span data-test="dataset-write">
        <Link to="/dataset/add/" data-test="add-chart-new-dataset">
          {t('Add a dataset')}
        </Link>{' '}
        {t('or')}{' '}
        <a
          href={this.state.docUrl}
          rel="noopener noreferrer"
          target="_blank"
          data-test="add-chart-new-dataset-instructions"
        >
          {`${VIEW_INSTRUCTIONS_TEXT} `}
          <Icons.Full iconSize="m" iconColor={theme.colorPrimary} />
        </a>
        .
      </span>
    ) : (
      <span data-test="no-dataset-write">
        <a
          href={this.state.docUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {`${VIEW_INSTRUCTIONS_TEXT} `}
          <Icons.Full iconSize="m" iconColor={theme.colorPrimary} />
        </a>
        .
      </span>
    );

    return (
      <StyledContainer>
        <h3>{t('Create a new chart')}</h3>
        <Steps direction="vertical" size="small">
          <Steps.Step
            title={<StyledStepTitle>{t('Choose a dataset')}</StyledStepTitle>}
            status={this.state.datasource?.value ? 'finish' : 'process'}
            description={
              <StyledStepDescription className="dataset">
                <AsyncSelect
                  autoFocus
                  ariaLabel={t('Dataset')}
                  name="select-datasource"
                  onChange={this.changeDatasource}
                  options={this.loadDatasources}
                  optionFilterProps={['id', 'customLabel']}
                  placeholder={t('Choose a dataset')}
                  showSearch
                  value={this.state.datasource}
                />
                {datasetHelpText}
              </StyledStepDescription>
            }
          />
          <Steps.Step
            title={<StyledStepTitle>{t('Choose chart type')}</StyledStepTitle>}
            status={this.state.vizType ? 'finish' : 'process'}
            description={
              <StyledStepDescription>
                <VizTypeGallery
                  denyList={denyList}
                  className="viz-gallery"
                  onChange={this.changeVizType}
                  onDoubleClick={this.onVizTypeDoubleClick}
                  selectedViz={this.state.vizType}
                />
              </StyledStepDescription>
            }
          />
        </Steps>
        <div className="footer">
          {isButtonDisabled && (
            <span>
              {t('Please select both a Dataset and a Chart type to proceed')}
            </span>
          )}
          <Button
            buttonStyle="primary"
            disabled={isButtonDisabled}
            onClick={this.gotoSlice}
          >
            {t('Create new chart')}
          </Button>
        </div>
      </StyledContainer>
    );
  }
}

export default withRouter(withToasts(withTheme(ChartCreation)));
