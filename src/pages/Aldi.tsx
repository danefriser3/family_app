import { useQuery } from "@apollo/client/react";
import { GET_ALDI_CATEGORIES, GET_ALDI_PRODUCTS } from "../graphql/queries";
import { AldiCategory, AldiProduct } from "../types/graphql";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import Clear from "@mui/icons-material/Clear";

export interface AldiProducts {
    aldiProducts: AldiProduct[];
}

const Aldi = () => {

    const { data } = useQuery<AldiProducts>(GET_ALDI_PRODUCTS);
    const { data: categoriesData } = useQuery<AldiCategory>(GET_ALDI_CATEGORIES);

    const [product, setProduct] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<AldiProduct[]>(data?.aldiProducts || []);
    const [category, setCategory] = useState('tutti');
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);

    useEffect(() => {
        setFilteredProducts(data?.aldiProducts || []);
    }, [data]);

    useEffect(() => {
        if (category !== 'tutti') {
            const filtered = data?.aldiProducts.filter(prod => prod.name.toLowerCase().includes(product.toLowerCase()) && prod.category === category) || [];
            setFilteredProducts(filtered);
            return;
        }
        setFilteredProducts(data?.aldiProducts.filter(prod => prod.name.toLowerCase().includes(product.toLowerCase())) || []);
        setPage(0);
    }, [product, data, category]);

    const onChange = (category: string) => {
        if (category === 'tutti') {
            if (product) {
                const filtered = data?.aldiProducts.filter(prod => prod.name.toLowerCase().includes(product.toLowerCase())) || [];
                setFilteredProducts(filtered);
                return;
            }
            setFilteredProducts(data?.aldiProducts || []);
        } else {
            if (product) {
                const filtered = data?.aldiProducts.filter(prod => prod.name.toLowerCase().includes(product.toLowerCase()) && prod.category === category) || [];
                setFilteredProducts(filtered);
                return;
            }
            const filtered = data?.aldiProducts.filter(product => product.category === category) || [];
            setFilteredProducts(filtered);
        }
        setPage(0);
    };
    const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return <Card>
        <CardHeader title="Prodotti Aldi" />
        <CardContent>
            <Typography variant="h6" gutterBottom>Elenco Prodotti {data?.aldiProducts.length} </Typography>

            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth >
                        <TextField value={product} onChange={(event) => { setProduct(event.target.value); }} size="small" label="Prodotto"
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setProduct('')} ><Clear fontSize="small" /></IconButton></InputAdornment>,
                                },
                            }} />
                    </FormControl>
                    <FormControl fullWidth >
                        <InputLabel id="demo-simple-select-label">Category</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={category}
                            label="Category"
                            onChange={(event) => { onChange(event.target.value); setCategory(event.target.value); }}
                            endAdornment={<InputAdornment position="start"><IconButton size="small" onClick={() => setCategory('tutti')} ><Clear fontSize="small" /></IconButton></InputAdornment>}
                        >
                            <MenuItem value={'tutti'}>Tutti</MenuItem>
                            {categoriesData?.aldiCategories.map((cat: { category: string }) => (
                                <MenuItem key={crypto.randomUUID()} value={cat.category}>{cat.category}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Immagine</TableCell>
                                <TableCell>Nome</TableCell>
                                <TableCell>Categoria</TableCell>
                                <TableCell align="right">Prezzo (€)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.image ? <img src={product.image} alt={product.name} style={{ width: 50, height: 50, objectFit: 'contain' }} /> : 'N/A'}
                                    </TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {paginatedProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography color="text.secondary">Nessun prodotto trovato</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={filteredProducts.length}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[10, 25, 50]}
                        labelRowsPerPage="Righe per pagina:"
                    />
                </TableContainer>
            </Stack>
        </CardContent>
    </Card>;
}

export default Aldi;
