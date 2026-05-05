import { HORIZONTAL_MENU_ITEM, MENU_ITEMS } from '@/data/menu-items';
import { MenuItemType } from '@/types/menu';

export const getMenuItems = (): MenuItemType[] => {
    return MENU_ITEMS;
};
export const getHorizontalMenuItems = (): MenuItemType[] => {
    return HORIZONTAL_MENU_ITEM;
};

export const findAllParent = (menuItems: MenuItemType[], menuItem: MenuItemType): string[] => {
    let parents: string[] = [];
    const parent = findMenuItem(menuItems, menuItem.parentKey);
    if (parent) {
        parents.push(parent.key);
        if (parent.parentKey) {
            parents = [...parents, ...findAllParent(menuItems, parent)];
        }
    }
    return parents;
};

export const getMenuItemFromURL = (items: MenuItemType | MenuItemType[], url: string): MenuItemType | undefined => {
    const cleanUrl = url.split(/[?#]/)[0];
    if (items instanceof Array) {
        for (const item of items) {
            const foundItem = getMenuItemFromURL(item, cleanUrl);
            if (foundItem) {
                return foundItem;
            }
        }
    } else {
        if (items.url == cleanUrl || (items.url && items.url !== '/' && cleanUrl.startsWith(items.url + '/'))) return items;
        if (items.children != null) {
            for (const item of items.children) {
                if (item.url == cleanUrl || (item.url && item.url !== '/' && cleanUrl.startsWith(item.url + '/'))) return item;
            }
        }
    }
};

export const findMenuItem = (menuItems: MenuItemType[] | undefined, menuItemKey: MenuItemType['key'] | undefined): MenuItemType | null => {
    if (menuItems && menuItemKey) {
        for (const item of menuItems) {
            if (item.key === menuItemKey) {
                return item;
            }
            const found = findMenuItem(item.children, menuItemKey);
            if (found) return found;
        }
    }
    return null;
};
