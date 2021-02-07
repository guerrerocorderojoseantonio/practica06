db.ventas.aggregate(
    [
        {
            $match: { 
                fecha_venta: {$gt: new Date("2020-05-01")}
            }
        },
        {
            $group:
            {
                _id: { 
                    año: {$year: "$fecha_venta" },
                    producto: "$producto"
                },
                venta_total: { $sum: { $multiply: ["$precio_de_venta", "$unidades"] } },
                gasto_total: { $sum: { $multiply: ["$precio_de_coste", "$unidades"] } }
            }
        },
        {
            $project: {
                año: "$_id.año",
                producto: "$_id.producto",
                _id: 0,
                totalv: "$venta_total",
                IVA: { $multiply: ["$venta_total", 0.21] },
                totalvIVA: { $multiply: ["$venta_total", 1.21] },
                totalRedondeado: { $round: [{ $multiply: ["$venta_total", 1.21] }, 0] },
                gastos: "$gasto_total",
                ganacias: {$subtract: [ "$venta_total", "$gasto_total" ] }
            }
        },
        {
            $sort: {
                año: 1, producto: 1
            }
        },
        {
            $match: {
                $expr: { $gt: [ "$totalvIVA", "$totalRedondeado" ] }
            }
        }
    ]
).pretty()