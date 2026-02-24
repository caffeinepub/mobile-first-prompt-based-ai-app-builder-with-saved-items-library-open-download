import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Item management
  type Item = {
    id : Text;
    content : Text;
    owner : Principal;
    isShared : Bool;
  };

  let items = Map.empty<Text, Item>();

  public shared ({ caller }) func createItem(id : Text, content : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot create items");
    };
    if (content.isEmpty()) {
      Runtime.trap("Content cannot be empty");
    };
    let newItem : Item = {
      id;
      content;
      owner = caller;
      isShared = false;
    };
    items.add(id, newItem);
  };

  public query ({ caller }) func getItem(id : Text) : async ?Item {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access private items");
    };
    switch (items.get(id)) {
      case (null) { null };
      case (?item) {
        if (item.owner == caller or item.isShared) {
          ?item;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listUserItems(user : Principal) : async [Item] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot list items");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own items");
    };
    let userItems = items.values().filter(
      func(item) {
        item.owner == user;
      }
    );
    userItems.toArray();
  };

  public shared ({ caller }) func updateItem(id : Text, newContent : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot update items");
    };
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can update this item");
        };
        let updatedItem : Item = {
          id = item.id;
          content = newContent;
          owner = item.owner;
          isShared = item.isShared;
        };
        items.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot delete items");
    };
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can delete this item");
        };
        items.remove(id);
      };
    };
  };

  public shared ({ caller }) func shareItem(id : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot share items");
    };
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can share this item");
        };
        let updatedItem : Item = {
          id = item.id;
          content = item.content;
          owner = item.owner;
          isShared = true;
        };
        items.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func unshareItem(id : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot unshare items");
    };
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can unshare this item");
        };
        let updatedItem : Item = {
          id = item.id;
          content = item.content;
          owner = item.owner;
          isShared = false;
        };
        items.add(id, updatedItem);
      };
    };
  };

  // Public shared item access - accessible to guests
  public query ({ caller }) func getSharedItem(id : Text) : async ?Item {
    switch (items.get(id)) {
      case (null) { null };
      case (?item) {
        if (item.isShared) { ?item } else { null };
      };
    };
  };
};
