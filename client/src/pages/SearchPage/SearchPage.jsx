import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { httpGet } from "../../services/httpService";
import SearchHeader from "./components/SearchHeader";
import FilterSection from "./components/FilterSection";
import ProductSection from "./components/ProductSection";

const SearchPage = () => {
  const [params] = useSearchParams();
  const keyword = params.get("keyword");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [filters, setFilters] = useState({
    category_ids: [],
    price_min: "",
    price_max: "",
    rating_min: "",
    sort: "",
    locations: [],
    logistics: [],
    conditions: [],
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    limit: 20,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await httpGet("/categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    if (!keyword) return;

    setLoading(true);
    const queryParams = new URLSearchParams({
      keyword,
      page: pagination.currentPage,
      limit: pagination.limit,
      ...filters,
    });

    // Xử lý array filters
    if (filters.category_ids && filters.category_ids.length > 0) {
      queryParams.set("category_ids", filters.category_ids.join(","));
    }
    if (filters.locations && filters.locations.length > 0) {
      queryParams.set("locations", filters.locations.join(","));
    }
    if (filters.logistics && filters.logistics.length > 0) {
      queryParams.set("logistics", filters.logistics.join(","));
    }
    if (filters.conditions && filters.conditions.length > 0) {
      queryParams.set("conditions", filters.conditions.join(","));
    }

    // Remove empty filters
    Object.keys(filters).forEach((key) => {
      if (
        !["category_ids", "locations", "logistics", "conditions"].includes(
          key
        ) &&
        !filters[key]
      ) {
        queryParams.delete(key);
      }
    });

    httpGet(`/search/products?${queryParams}`)
      .then((res) => {
        setProducts(res.data || []);
        setPagination((prev) => ({
          ...prev,
          ...res.pagination,
        }));
      })
      .catch((err) => {
        console.error("Search error:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [keyword, filters, pagination.currentPage]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePriceRangeChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      price_min: value[0],
      price_max: value[1],
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCategoryFilter = (checkedValues) => {
    handleFilterChange("category_ids", checkedValues);
  };

  const handleLocationFilter = (checkedValues) => {
    handleFilterChange("locations", checkedValues);
  };

  const handleLogisticFilter = (checkedValues) => {
    handleFilterChange("logistics", checkedValues);
  };

  const handleConditionFilter = (checkedValues) => {
    handleFilterChange("conditions", checkedValues);
  };

  const handleRatingFilter = (value) => {
    handleFilterChange("rating_min", value);
  };

  const handleSortChange = (value) => {
    handleFilterChange("sort", value);
  };

  const clearAllFilters = () => {
    setFilters({
      category_ids: [],
      price_min: "",
      price_max: "",
      rating_min: "",
      sort: "",
      locations: [],
      logistics: [],
      conditions: [],
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Container với max-width 1400px */}
      <div className="max-w-[1400px] mx-auto px-4">
        <SearchHeader keyword={keyword} totalItems={pagination.totalItems} />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6} xl={5}>
            <FilterSection
              categories={categories}
              categoriesLoading={categoriesLoading}
              filters={filters}
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
              onCategoryFilter={handleCategoryFilter}
              onLocationFilter={handleLocationFilter}
              onLogisticFilter={handleLogisticFilter}
              onConditionFilter={handleConditionFilter}
              onRatingFilter={handleRatingFilter}
              onClearAllFilters={clearAllFilters}
            />
          </Col>

          <Col xs={24} lg={18} xl={19}>
            <ProductSection
              products={products}
              loading={loading}
              pagination={pagination}
              filters={filters}
              categories={categories}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
              onFilterChange={handleFilterChange}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SearchPage;
