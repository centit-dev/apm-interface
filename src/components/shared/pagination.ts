export const defaultPagination = {
	pageNo: 1,
	pageSize: 10,
};

export const showTotal = (total: number, range: number[]) => {
	return `第 ${range[0]} - ${range[1]} 条，共 ${total} 条`;
};
