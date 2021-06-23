import {calculateGradient} from "./NewBadge";
import moment, {Moment} from "moment";


describe('NewBadge', () => {
    
    describe('calculateGradient()', () => {
        it('should return empty string if newPersonDate is today',  () =>  {

            const newPersonDate: Date = moment().toDate();

            expect(calculateGradient(newPersonDate)).toBe('');
        });


        it('should return stage2 string if today is 8 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = moment().subtract(8, 'days').toDate()

            expect(calculateGradient(newPersonDate)).toBe('stage2');
        });

        it('should return stage2 string if today is 15 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = moment().subtract(15, 'days').toDate()

            expect(calculateGradient(newPersonDate)).toBe('stage2');
        });

        it('should return stage3 string if today is 16 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = moment().subtract(16, 'days').toDate()

            expect(calculateGradient(newPersonDate)).toBe('stage3');
        });

        it('should return stage3 string if today is 100 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = moment().subtract(100, 'days').toDate()

            expect(calculateGradient(newPersonDate)).toBe('stage3');
        });
    });



});
