#include <cmath>
#include <cstdint>
#include <iostream>
#include <fstream>
#include "testcase/Case.h"
#include <iomanip>

#define TESTCASE 1

#if TESTCASE==1
int main() {

	const std::string fn = "testcases.txt";
	std::ifstream infile(fn);
	if(!infile.is_open()){//not open if run using shortcut
		println("need to run under eclipse");
		return 0;
	}
	std::string s, q[3];
	int i, j, k, r[] = { 0, 0 }, li[3],line;
	TestCase::Case t;

	i = 0;
	line = 1;
	while (std::getline(infile, s)) {
		if (s.empty()) {
			line++;
			continue;
		}
		q[i % 3] = s;
		li[i%3]=line;
		if (i % 3 == 2) {
			t.set(q, li);
			r[t.test()]++;
		}
		i++;
		line++;
	}

	j = r[0] + r[1];
	k = log10(j) + 1;
	for (i = 1; i >= 0; i--) {
		println("%-5s %*d/%d=%5.1lf%%", i ? "ok" : "error", k, r[i], j,
				r[i] * 100. / j);
	}
	if(r[0]){
		printeln("errors found");
	}
}

#elif TESTCASE==0
int main() {
	double v=ExpressionEstimator::calculate("pow (sin(pi/4),2)");
	std::cout<<v;
	ExpressionEstimator e;
	e.compile("x0+2*sin(pi*x1)","atan2");
}
#else
int main() {
	std::cout<<std::setprecision (std::numeric_limits<double>::digits10 + 1);
	const std::string reservedWords[] = {
			//"random",
			"pi", "e", "sqrt2", "sqrt1_2", "ln2", "ln10",
			"log2e", "log10e",
			"exp", "log", "sqrt", "abs",
			 "sin", "cos", "tan", "cot", "sec", "csc", "asin",
			"acos", "atan", "acot", "asec", "acsc", "sinh", "cosh", "tanh", "coth",
			"sech", "csch", "asinh", "acosh", "atanh", "acoth", "asech", "acsch",
			"ceil", "floor", "round"
			, "atan2", "pow", "min", "max" };
	auto ipi=std::find(begin(reservedWords),end(reservedWords),"pi")-begin(reservedWords);
	auto ilog10e=std::find(begin(reservedWords),end(reservedWords),"log10e")-begin(reservedWords);
	auto iatan2=std::find(begin(reservedWords),end(reservedWords),"atan2")-begin(reservedWords);
	//std::cout<<i_pi<<"\n";
	std::vector<std::string> v;

	int i=-1;
for(auto e:reservedWords){
	i++;
	auto s=e;
	if(i>=iatan2){
		s+="(2,.5)";
	}
	else if(i<ipi || i>ilog10e){
		s+="(2)";
	}
	v.push_back(s);
}

std::string a[]={"1+2","1-2","1*2","1/2","1&2","-1","+1","(1+","(1+2)","[1+2)","[1+2.1]","{1+2.}","1+("};

v.insert( v.end(), std::begin(a), std::end(a) );

	for (auto e : v) {
		std::cout << "\"" << e << "\"\nstatic_compile\n";
		try {
			auto v = ExpressionEstimator::calculate(e);
			std::cout << v ;
		} catch (std::exception &e) {
			std::cout <<"compile_error";//<< e.what();
		}
		std::cout << "\n\n";
	}

	//auto a=M_PI;
//	int a[]={1,2};
	//std::cout<<a;
//	A a;
//	//uintptr_t aa;
//	uint64_t pa=reinterpret_cast<uint64_t>(&a),paa=uint64_t(&a.a),pab=uint64_t(&a.b);
//	std::cout<<pa<<" "<<paa<<" "<<pab<<" ";

}
#endif
