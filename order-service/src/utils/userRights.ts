export enum UserRights {
  CREATE_PRODUCT = "post_product",
  UPDATE_PRODUCT = "update_Product",
  DELETE_PRODUCT = "delete_Product",
  VIEW_PRODUCT = "view_product",
  PLACE_ORDER = "place_order",
  UPDATE_ORDER = "update_order",
  CANCEL_ORDER = "cancel_order",
}

export const adminUserRights = [
  UserRights.CREATE_PRODUCT,
  UserRights.DELETE_PRODUCT,
  UserRights.UPDATE_PRODUCT,
  UserRights.VIEW_PRODUCT,
];

export const normalUserRights = [
  UserRights.PLACE_ORDER,
  UserRights.UPDATE_ORDER,
  UserRights.CANCEL_ORDER,
  UserRights.VIEW_PRODUCT,
];
