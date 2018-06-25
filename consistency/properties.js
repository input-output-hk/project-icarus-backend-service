
const txAddrConsistentProp = (constApi) => async () => {
  const { rows: numberInconsistentRows } = await constApi.numberRowsInconsistentTxAddr();
  return numberInconsistentRows[0].count == 0;
};

module.exports = (constApi) => ({
  txAddrConsistentProp: txAddrConsistentProp(constApi),
});
