'use strict';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SizeGuidePage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-primary mb-6 text-center">Size Guide</h1>
            <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                Find your perfect fit with our detailed size charts. If you are between sizes, we recommend sizing up for a more relaxed fit.
            </p>

            <div className="space-y-12">
                {/* Men's Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-primary">Men's Clothing</h2>

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Tops (Shirts, T-Shirts, Jackets)</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Size</TableHead>
                                        <TableHead>Chest (in)</TableHead>
                                        <TableHead>Waist (in)</TableHead>
                                        <TableHead>Shoulder (in)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">S</TableCell>
                                        <TableCell>36-38</TableCell>
                                        <TableCell>28-30</TableCell>
                                        <TableCell>17</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">M</TableCell>
                                        <TableCell>38-40</TableCell>
                                        <TableCell>30-32</TableCell>
                                        <TableCell>17.5</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">L</TableCell>
                                        <TableCell>40-42</TableCell>
                                        <TableCell>32-34</TableCell>
                                        <TableCell>18</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">XL</TableCell>
                                        <TableCell>42-44</TableCell>
                                        <TableCell>34-36</TableCell>
                                        <TableCell>18.5</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">XXL</TableCell>
                                        <TableCell>44-46</TableCell>
                                        <TableCell>36-38</TableCell>
                                        <TableCell>19</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Bottoms (Jeans, Trousers)</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Size</TableHead>
                                        <TableHead>Waist (in)</TableHead>
                                        <TableHead>Inseam (in)</TableHead>
                                        <TableHead>Hip (in)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">30</TableCell>
                                        <TableCell>30</TableCell>
                                        <TableCell>32</TableCell>
                                        <TableCell>37</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">32</TableCell>
                                        <TableCell>32</TableCell>
                                        <TableCell>32</TableCell>
                                        <TableCell>39</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">34</TableCell>
                                        <TableCell>34</TableCell>
                                        <TableCell>32.5</TableCell>
                                        <TableCell>41</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">36</TableCell>
                                        <TableCell>36</TableCell>
                                        <TableCell>32.5</TableCell>
                                        <TableCell>43</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </section>

                {/* Women's Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-primary">Women's Clothing</h2>

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Dresses & Tops</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Size</TableHead>
                                        <TableHead>Bust (in)</TableHead>
                                        <TableHead>Waist (in)</TableHead>
                                        <TableHead>Hip (in)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">XS (0-2)</TableCell>
                                        <TableCell>31-32</TableCell>
                                        <TableCell>24-25</TableCell>
                                        <TableCell>34-35</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">S (4-6)</TableCell>
                                        <TableCell>33-34</TableCell>
                                        <TableCell>26-27</TableCell>
                                        <TableCell>36-37</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">M (8-10)</TableCell>
                                        <TableCell>35-36</TableCell>
                                        <TableCell>28-29</TableCell>
                                        <TableCell>38-39</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">L (12-14)</TableCell>
                                        <TableCell>37-39</TableCell>
                                        <TableCell>30-32</TableCell>
                                        <TableCell>40-42</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
