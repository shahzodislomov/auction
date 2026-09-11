import { useState, useEffect } from "react";
import { api } from "../api/api";

const useGovData = () => {
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/gov/regions');
      setRegions(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchDistricts = async (regionId) => {
    try {
      setLoading(true);
      const normalizedRegionId = String(regionId ?? "").trim();

      if (!normalizedRegionId) {
        throw new Error("region_id_required");
      }

      const response = await api.get(
        `/gov/district-of-region/${encodeURIComponent(normalizedRegionId)}`,
      );
      setDistricts(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions(); // Fetch regions when the component is mounted
  }, []);

  return { regions, districts, fetchDistricts, loading, error };
};

export default useGovData;
