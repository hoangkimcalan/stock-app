/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildTree(items: any[]) {
  const stack: any[] = [];
  const root: any[] = [];

  for (const item of items) {
    // Tạo node mới và copy thủ công để tránh mất dữ liệu từ Mongoose
    const node = {
      itemCode: item.itemCode,
      itemName: item.itemName,
      displayLevel: item.displayLevel,
      data: item.data || [],
      children: [] as any[]
    };

    while (stack.length > 0 && stack[stack.length - 1].displayLevel >= node.displayLevel) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }
  return root;
}
