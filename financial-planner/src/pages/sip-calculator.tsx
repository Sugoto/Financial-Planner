import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Calculator,
  DollarSign,
  Target,
  Calendar,
  Percent,
} from "lucide-react";
import { formatIndianNumber } from "@/lib/utils";
import { useSipInvestment } from "@/hooks/useFinancialData";

export function SipCalculatorPage() {
  const { sipData, loading, updateSipInvestment } = useSipInvestment();

  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState([12]);
  const [investmentPeriod, setInvestmentPeriod] = useState([15]);
  const [lumpSumAmount, setLumpSumAmount] = useState(100000);

  // Update local state when SIP data loads
  useEffect(() => {
    if (sipData && !loading) {
      setMonthlyInvestment(sipData.monthlyInvestment);
      setExpectedReturn([sipData.expectedReturn]);
      setInvestmentPeriod([sipData.investmentPeriod]);
    }
  }, [sipData, loading]);

  // SIP Calculations
  const monthlyRate = expectedReturn[0] / 100 / 12;
  const totalMonths = investmentPeriod[0] * 12;
  const totalInvestment = monthlyInvestment * totalMonths;

  // Future Value of SIP formula: PMT * [((1 + r)^n - 1) / r] * (1 + r)
  const maturityAmount =
    monthlyInvestment *
    (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
      (1 + monthlyRate));

  const totalReturns = maturityAmount - totalInvestment;

  // Lump Sum Calculations
  const lumpSumMaturity =
    lumpSumAmount * Math.pow(1 + expectedReturn[0] / 100, investmentPeriod[0]);
  const lumpSumReturns = lumpSumMaturity - lumpSumAmount;

  // Step-up SIP (assuming 10% annual increase)
  const stepUpRate = 0.1;
  let stepUpMaturity = 0;
  let stepUpInvestment = 0;

  for (let year = 1; year <= investmentPeriod[0]; year++) {
    const yearlyInvestment =
      monthlyInvestment * Math.pow(1 + stepUpRate, year - 1) * 12;
    const yearsRemaining = investmentPeriod[0] - year + 1;
    stepUpMaturity +=
      yearlyInvestment *
      Math.pow(1 + expectedReturn[0] / 100, yearsRemaining - 1);
    stepUpInvestment += yearlyInvestment;
  }

  const stepUpReturns = stepUpMaturity - stepUpInvestment;

  const handleSipUpdate = async () => {
    await updateSipInvestment({
      monthlyInvestment,
      expectedReturn: expectedReturn[0],
      investmentPeriod: investmentPeriod[0],
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8" />
            SIP Calculator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
          <TrendingUp className="h-8 w-8" />
          SIP Calculator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Calculate your Systematic Investment Plan returns and plan your
          investments
        </p>
      </div>

      <Tabs defaultValue="sip" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
          <TabsTrigger value="comparison">SIP vs Lump Sum</TabsTrigger>
          <TabsTrigger value="stepup">Step-up SIP</TabsTrigger>
        </TabsList>

        <TabsContent value="sip" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Input Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Parameters</CardTitle>
                <CardDescription>
                  Configure your SIP investment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="monthly-investment">Monthly Investment</Label>
                  <Input
                    id="monthly-investment"
                    type="text"
                    value={`₹${formatIndianNumber(monthlyInvestment)}`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[₹,]/g, "");
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        setMonthlyInvestment(numValue);
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Expected Annual Return</Label>
                  <Slider
                    value={expectedReturn}
                    onValueChange={setExpectedReturn}
                    max={25}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1%</span>
                    <span className="font-medium">
                      {expectedReturn[0]}% per annum
                    </span>
                    <span>25%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Investment Period</Label>
                  <Slider
                    value={investmentPeriod}
                    onValueChange={setInvestmentPeriod}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1 year</span>
                    <span className="font-medium">
                      {investmentPeriod[0]} years
                    </span>
                    <span>30 years</span>
                  </div>
                </div>

                <Button className="w-full" onClick={handleSipUpdate}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Results</CardTitle>
                <CardDescription>
                  Your SIP investment projection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold">
                      ₹{formatIndianNumber(totalInvestment)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Investment
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold">
                      ₹{formatIndianNumber(totalReturns)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Returns
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <div className="text-3xl font-bold text-green-600">
                    ₹{formatIndianNumber(maturityAmount)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maturity Amount
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Investment</span>
                    <span>
                      {((totalInvestment / maturityAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${(totalInvestment / maturityAmount) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Returns</span>
                    <span>
                      {((totalReturns / maturityAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis of your SIP investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                  <div className="text-xl font-bold">{totalMonths}</div>
                  <p className="text-sm text-muted-foreground">Total Months</p>
                </div>

                <div className="text-center">
                  <Percent className="h-6 w-6 mx-auto text-orange-600 mb-2" />
                  <div className="text-xl font-bold">{expectedReturn[0]}%</div>
                  <p className="text-sm text-muted-foreground">Annual Return</p>
                </div>

                <div className="text-center">
                  <DollarSign className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                  <div className="text-xl font-bold">
                    ₹{formatIndianNumber(monthlyInvestment)}
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly SIP</p>
                </div>

                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <div className="text-xl font-bold">
                    {((totalReturns / totalInvestment) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Return %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lump Sum Investment</CardTitle>
                <CardDescription>
                  One-time investment calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lump-sum">Investment Amount</Label>
                  <Input
                    id="lump-sum"
                    type="number"
                    value={lumpSumAmount}
                    onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm">Initial Investment</span>
                    <span className="font-medium">
                      ₹{formatIndianNumber(lumpSumAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maturity Amount</span>
                    <span className="font-medium text-green-600">
                      ₹{formatIndianNumber(lumpSumMaturity)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Returns</span>
                    <span className="font-medium text-green-600">
                      ₹{formatIndianNumber(lumpSumReturns)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SIP vs Lump Sum Comparison</CardTitle>
                <CardDescription>
                  Which investment strategy works better?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">SIP Returns</span>
                    <span className="font-bold text-blue-600">
                      ₹{formatIndianNumber(totalReturns)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Lump Sum Returns
                    </span>
                    <span className="font-bold text-purple-600">
                      ₹{formatIndianNumber(lumpSumReturns)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Better Strategy</span>
                    <span
                      className={`font-bold ${
                        totalReturns > lumpSumReturns
                          ? "text-blue-600"
                          : "text-purple-600"
                      }`}
                    >
                      {totalReturns > lumpSumReturns ? "SIP" : "Lump Sum"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {totalReturns > lumpSumReturns
                      ? "SIP provides better returns due to rupee cost averaging and compounding benefits over time."
                      : "Lump sum investment provides better returns in this scenario, but SIP offers better risk management."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stepup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step-up SIP Calculator</CardTitle>
              <CardDescription>
                Calculate returns with annual SIP increase (assuming 10% yearly
                increase)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Regular SIP</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Investment</span>
                      <span className="font-medium">
                        ₹{formatIndianNumber(totalInvestment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Maturity Amount</span>
                      <span className="font-medium text-green-600">
                        ₹{formatIndianNumber(maturityAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Returns</span>
                      <span className="font-medium text-green-600">
                        ₹{formatIndianNumber(totalReturns)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Step-up SIP (10% increase)
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Investment</span>
                      <span className="font-medium">
                        ₹{formatIndianNumber(stepUpInvestment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Maturity Amount</span>
                      <span className="font-medium text-green-600">
                        ₹{formatIndianNumber(stepUpMaturity)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Returns</span>
                      <span className="font-medium text-green-600">
                        ₹{formatIndianNumber(stepUpReturns)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Step-up SIP Advantage
                </h4>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  ₹{formatIndianNumber(stepUpReturns - totalReturns)}
                </div>
                <p className="text-sm text-green-700">
                  Additional returns with step-up SIP compared to regular SIP
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
