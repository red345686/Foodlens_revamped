import dotenv from 'dotenv';
dotenv.config();

const api_uri = process.env.API_URL;

// Fetch product details by barcode
export async function fetchProductByBarcode(barcode) {
    try {
        const res = await fetch(`${api_uri}/api/v2/product/${barcode}.json`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        console.log("Product Details:", data);
        return data;
    } catch (error) {
        console.log("Error fetching product details:", error.message);
    }
}

// Search products by name/keyword
export async function searchProductsByName(name) {
    try {
        const res = await fetch(`${api_uri}/cgi/search.pl?search_terms=${name}&json=true`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        console.log("Search Results:", data);
        return data;
    } catch (error) {
        console.log("Error searching products by name:", error.message);
    }
}

// Get products by category 
export async function fetchProductsByCategory(category) {
    https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=beverages&page_size=20&json=true

    try {
        const res = await fetch(`${api_uri}/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${category}&page_size=20&json=true`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        console.log("Category Products:", data);
        return data;
    } catch (error) {
        console.log("Error fetching products by category:", error.message);
    }
}


// Fetch a random product
export async function fetchRandomProduct() {
   
    try {
        const res = await fetch(`${api_uri}/cgi/search.pl?action=process&sort_by=random&page_size=20&json=true`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        console.log("Random Product:", data);
        return data;
    } catch (error) {
        console.log("Error fetching random product:", error.message);
    }
}

// Advanced search with filters 
export async function advancedSearch(tagType, tagValue) {
    try {
        const res = await fetch(`${api_uri}/cgi/search.pl?action=process&tagtype_0=${tagType}&tag_contains_0=contains&tag_0=${tagValue}&json=true`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        console.log("Advanced Search Results:", data);
        return data;
    } catch (error) {
        console.log("Error performing advanced search:", error.message);
    }
}

// Example function calls
// fetchProductByBarcode(737628064502);
// searchProductsByName("milk");
// fetchProductsByCategory("beverages");
// fetchRandomProduct();
// advancedSearch("categories", "chocolates");
