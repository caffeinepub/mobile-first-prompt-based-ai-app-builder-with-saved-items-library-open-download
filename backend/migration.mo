import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    name : Text;
  };
  type AppCreation = {
    id : Text;
    content : Text;
    owner : Principal;
    isShared : Bool;
  };
  type Item = {
    id : Text;
    content : Text;
    owner : Principal;
    isShared : Bool;
  };
  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    items : Map.Map<Text, Item>;
  };
  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    appCreations : Map.Map<Text, AppCreation>;
  };

  public func run(old : OldActor) : NewActor {
    let appCreations = old.items.map<Text, Item, AppCreation>(
      func(_, item) {
        item;
      }
    );
    {
      userProfiles = old.userProfiles;
      appCreations;
    };
  };
};
