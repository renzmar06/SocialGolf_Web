declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string;
                types?: string[];
              },
              callback: (
                predictions: Array<{
                  place_id: string;
                  description: string;
                }> | null,
                status: string
              ) => void
            ) => void;
          };
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
  }
}

export {};