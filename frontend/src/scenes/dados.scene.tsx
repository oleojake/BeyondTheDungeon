import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Dices } from "lucide-react";

interface DiceRoll {
  type: number;
  result: number;
  result2?: number;
  modifier: number;
  finalResult: number;
  timestamp: string;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20];

// Componente para representar visualmente un dado
const DiceIcon = ({ faces }: { faces: number }) => {
  const size = 64;
  
  return (
    <div 
      className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold text-xl">d{faces}</span>
    </div>
  );
};

export const DadosScene = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDice, setSelectedDice] = useState<number | null>(null);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [rollResult2, setRollResult2] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [hasAdvantage, setHasAdvantage] = useState(false);
  const [hasDisadvantage, setHasDisadvantage] = useState(false);
  const [modifier, setModifier] = useState(0);

  // Cargar historial desde sessionStorage al montar el componente
  useEffect(() => {
    const savedHistory = sessionStorage.getItem("diceHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Guardar historial en sessionStorage cuando cambie
  useEffect(() => {
    if (history.length > 0) {
      sessionStorage.setItem("diceHistory", JSON.stringify(history));
    }
  }, [history]);

  const rollDice = (faces: number) => {
    setSelectedDice(faces);
    setIsRolling(true);
    setRollResult(null);
    setRollResult2(null);

    const needsTwoRolls = hasAdvantage || hasDisadvantage;

    // Simular animación de tirada
    let counter = 0;
    const interval = setInterval(() => {
      setRollResult(Math.floor(Math.random() * faces) + 1);
      if (needsTwoRolls) {
        setRollResult2(Math.floor(Math.random() * faces) + 1);
      }
      counter++;
      
      if (counter > 10) {
        clearInterval(interval);
        const result1 = Math.floor(Math.random() * faces) + 1;
        const result2 = needsTwoRolls ? Math.floor(Math.random() * faces) + 1 : null;
        
        setRollResult(result1);
        setRollResult2(result2);
        setIsRolling(false);

        // Calcular resultado final
        let baseResult = result1;
        if (result2 !== null) {
          baseResult = hasAdvantage ? Math.max(result1, result2) : Math.min(result1, result2);
        }
        const finalResult = baseResult + modifier;

        // Agregar al historial
        const newRoll: DiceRoll = {
          type: faces,
          result: result1,
          result2: result2 || undefined,
          modifier: modifier,
          finalResult: finalResult,
          timestamp: new Date().toLocaleTimeString(),
          hasAdvantage: hasAdvantage,
          hasDisadvantage: hasDisadvantage,
        };
        setHistory((prev) => [newRoll, ...prev].slice(0, 50)); // Mantener últimas 50 tiradas
      }
    }, 50);
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem("diceHistory");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
        <div className="flex items-center gap-3 mb-2">
          <Dices className="h-8 w-8 text-amber-200" />
          <h1 className="text-3xl font-bold text-amber-50">Lanzador de Dados</h1>
        </div>
        <p className="text-sm text-amber-100/90">
          Selecciona el tipo de dado y obtén un resultado aleatorio.
        </p>
      </section>

      {/* Botones de dados */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Selecciona tu dado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {DICE_TYPES.map((faces) => (
              <button
                key={faces}
                onClick={() => {
                  setIsDialogOpen(true);
                  rollDice(faces);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-purple-500 transition-all duration-200 hover:bg-accent"
              >
                <DiceIcon faces={faces} />
                <span className="text-sm font-medium">{faces} caras</span>
              </button>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          {/* Modificadores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Modificadores</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="advantage" 
                checked={hasAdvantage}
                onCheckedChange={(checked) => {
                  setHasAdvantage(checked === true);
                  if (checked) setHasDisadvantage(false);
                }}
              />
              <Label htmlFor="advantage" className="cursor-pointer">
                Ventaja (tirar 2 dados, elegir el mayor)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="disadvantage" 
                checked={hasDisadvantage}
                onCheckedChange={(checked) => {
                  setHasDisadvantage(checked === true);
                  if (checked) setHasAdvantage(false);
                }}
              />
              <Label htmlFor="disadvantage" className="cursor-pointer">
                Desventaja (tirar 2 dados, elegir el menor)
              </Label>
            </div>
            
            <div className="flex items-center gap-4">
              <Label htmlFor="modifier" className="whitespace-nowrap">
                Modificador:
              </Label>
              <Select
                value={modifier.toString()}
                onValueChange={(value) => setModifier(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 41 }, (_, i) => i - 20).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num >= 0 ? '+' : ''}{num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de tiradas */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Historial de Tiradas</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearHistory}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((roll, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                      d{roll.type}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {(roll.hasAdvantage || roll.hasDisadvantage) && roll.result2 ? (
                          <>
                            Resultados: {roll.result} y {roll.result2} ({roll.hasAdvantage ? 'Ventaja' : 'Desventaja'})
                            {roll.modifier !== 0 && (
                              <> ({roll.hasAdvantage ? Math.max(roll.result, roll.result2) : Math.min(roll.result, roll.result2)} {roll.modifier >= 0 ? '+' : ''}{roll.modifier} = {roll.finalResult})</>
                            )}
                          </>
                        ) : (
                          <>
                            Resultado: {roll.result}
                            {roll.modifier !== 0 && (
                              <> ({roll.result} {roll.modifier >= 0 ? '+' : ''}{roll.modifier} = {roll.finalResult})</>
                            )}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{roll.timestamp}</p>
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      roll.finalResult === roll.type + roll.modifier
                        ? "text-green-500"
                        : roll.result === 1
                        ? "text-red-500"
                        : "text-primary"
                    }`}
                  >
                    {roll.finalResult}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog/Popup de resultado */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-foreground">
              🎲 Tirando d{selectedDice} {hasAdvantage && "(con Ventaja)"} {hasDisadvantage && "(con Desventaja)"}
            </DialogTitle>
            <DialogDescription className="text-center text-foreground/80">
              {isRolling ? "Rodando el dado..." : "¡Resultado obtenido!"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            {rollResult !== null && (
              <div className="flex flex-col items-center gap-4">
                {(hasAdvantage || hasDisadvantage) && rollResult2 !== null ? (
                  <div className="flex gap-8 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`text-6xl font-bold transition-all duration-300 ${
                          isRolling ? "scale-110 opacity-50" : "scale-100 opacity-100"
                        } ${
                          !isRolling && ((hasAdvantage && rollResult >= rollResult2) || (hasDisadvantage && rollResult <= rollResult2))
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {rollResult}
                      </div>
                      <span className="text-xs text-foreground/60 mt-1">Dado 1</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`text-6xl font-bold transition-all duration-300 ${
                          isRolling ? "scale-110 opacity-50" : "scale-100 opacity-100"
                        } ${
                          !isRolling && ((hasAdvantage && rollResult2 > rollResult) || (hasDisadvantage && rollResult2 < rollResult))
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {rollResult2}
                      </div>
                      <span className="text-xs text-foreground/60 mt-1">Dado 2</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-8xl font-bold transition-all duration-300 ${
                      isRolling ? "scale-110 opacity-50" : "scale-100 opacity-100"
                    } ${
                      rollResult === selectedDice
                        ? "text-green-600 dark:text-green-400"
                        : rollResult === 1
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {rollResult}
                  </div>
                )}
                
                {!isRolling && modifier !== 0 && (
                  <div className="text-2xl font-semibold text-center text-foreground">
                    {(hasAdvantage || hasDisadvantage) && rollResult2 !== null ? (
                      <>
                        {hasAdvantage ? Math.max(rollResult, rollResult2) : Math.min(rollResult, rollResult2)} {modifier >= 0 ? '+' : ''}{modifier} = <span className="text-blue-600 dark:text-blue-400">{(hasAdvantage ? Math.max(rollResult, rollResult2) : Math.min(rollResult, rollResult2)) + modifier}</span>
                      </>
                    ) : (
                      <>
                        {rollResult} {modifier >= 0 ? '+' : ''}{modifier} = <span className="text-blue-600 dark:text-blue-400">{rollResult + modifier}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!isRolling && !hasAdvantage && !hasDisadvantage && rollResult === selectedDice && (
              <p className="mt-4 text-green-600 dark:text-green-400 font-semibold animate-pulse">
                ¡Crítico! Máximo resultado
              </p>
            )}
            {!isRolling && !hasAdvantage && !hasDisadvantage && rollResult === 1 && (
              <p className="mt-4 text-red-600 dark:text-red-400 font-semibold animate-pulse">
                ¡Pifia! Resultado mínimo
              </p>
            )}
            {!isRolling && hasAdvantage && rollResult2 !== null && (
              <p className="mt-4 text-foreground font-semibold">
                Resultado seleccionado (mayor): {Math.max(rollResult!, rollResult2)}
              </p>
            )}
            {!isRolling && hasDisadvantage && rollResult2 !== null && (
              <p className="mt-4 text-foreground font-semibold">
                Resultado seleccionado (menor): {Math.min(rollResult!, rollResult2)}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex justify-center gap-3 pt-4">
            <Button 
              onClick={() => rollDice(selectedDice!)} 
              disabled={isRolling}
              variant="default"
            >
              Tirar de nuevo
            </Button>
            <Button 
              onClick={() => setIsDialogOpen(false)} 
              variant="outline"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DadosScene;
