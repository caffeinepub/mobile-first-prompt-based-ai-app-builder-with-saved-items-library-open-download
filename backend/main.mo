import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Iter "mo:core/Iter";


// Run migration when upgrading from previous version

actor {
  // Initialize state for imported components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User profiles
  public type UserProfile = {
    name : Text;
    // Additional fields can be added here
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

  // App creation management
  type AppCreation = {
    id : Text;
    content : Text;
    owner : Principal;
    isShared : Bool;
  };

  let appCreations = Map.empty<Text, AppCreation>();

  public shared ({ caller }) func generateAppCreation(id : Text, content : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot create apps");
    };
    if (content.isEmpty()) {
      Runtime.trap("Content cannot be empty");
    };
    let newApp : AppCreation = {
      id;
      content;
      owner = caller;
      isShared = false;
    };
    appCreations.add(id, newApp);
  };

  public query ({ caller }) func getAppCreation(id : Text) : async ?AppCreation {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access private apps");
    };
    switch (appCreations.get(id)) {
      case (null) { null };
      case (?app) {
        if (app.owner == caller or app.isShared) {
          ?app;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listUserAppCreations(user : Principal) : async [AppCreation] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot list apps");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own apps");
    };
    let userApps = appCreations.values().filter(
      func(app) {
        app.owner == user;
      }
    );
    userApps.toArray();
  };

  public shared ({ caller }) func updateAppCreation(id : Text, newContent : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot update apps");
    };
    switch (appCreations.get(id)) {
      case (null) { Runtime.trap("App not found") };
      case (?app) {
        if (app.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can update this app");
        };
        let updatedApp : AppCreation = {
          id = app.id;
          content = newContent;
          owner = app.owner;
          isShared = app.isShared;
        };
        appCreations.add(id, updatedApp);
      };
    };
  };

  public shared ({ caller }) func deleteAppCreation(id : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot delete apps");
    };
    switch (appCreations.get(id)) {
      case (null) { Runtime.trap("App not found") };
      case (?app) {
        if (app.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can delete this app");
        };
        appCreations.remove(id);
      };
    };
  };

  public shared ({ caller }) func shareAppCreation(id : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot share apps");
    };
    switch (appCreations.get(id)) {
      case (null) { Runtime.trap("App not found") };
      case (?app) {
        if (app.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can share this app");
        };
        let updatedApp : AppCreation = {
          id = app.id;
          content = app.content;
          owner = app.owner;
          isShared = true;
        };
        appCreations.add(id, updatedApp);
      };
    };
  };

  public shared ({ caller }) func unshareAppCreation(id : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot unshare apps");
    };
    switch (appCreations.get(id)) {
      case (null) { Runtime.trap("App not found") };
      case (?app) {
        if (app.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can unshare this app");
        };
        let updatedApp : AppCreation = {
          id = app.id;
          content = app.content;
          owner = app.owner;
          isShared = false;
        };
        appCreations.add(id, updatedApp);
      };
    };
  };

  // Public shared app access - accessible to guests
  public query ({ caller }) func getSharedAppCreation(id : Text) : async ?AppCreation {
    switch (appCreations.get(id)) {
      case (null) { null };
      case (?app) {
        if (app.isShared) { ?app } else { null };
      };
    };
  };
};
