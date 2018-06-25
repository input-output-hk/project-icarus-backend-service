const ExplorerApi = require('./ExplorerApi');

const txAddrConsistentProp = (constApi) => async () => {
  const { rows: numberInconsistentRows } = await constApi.numberRowsInconsistentTxAddr();
  return numberInconsistentRows[0].count == 0;
};

//FIXME: Do sth
const txsConsistentProp = (constApi) => async () => {
  const txExplorer = await ExplorerApi.txs.getInfo('90281c107bc070bff73604aa4566491b55e8ac06981e216f74c0c8e03d05fe80');
  const tx = await constApi.getTxByHash('90281c107bc070bff73604aa4566491b55e8ac06981e216f74c0c8e03d05fe80');
  return [tx, txExplorer];
};

module.exports = (constApi) => ({
  txAddrConsistentProp: txAddrConsistentProp(constApi),
  txsConsistentProp: txsConsistentProp(constApi),
});
